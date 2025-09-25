import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentToken, selectRefreshToken, selectCurrentUser, setCredentials } from '@/features/auth/authSlice';
import { decodeJwtExpiryMs } from '@/hooks/use-token-countdown';
import { useRefreshMutation } from '@/features/auth/authApi';

const CHECK_INTERVAL_MS = 5000;

export default function AuthExpiryGuard() {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectCurrentToken);
  const refreshToken = useSelector(selectRefreshToken);
  const currentUser = useSelector(selectCurrentUser);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    function clearTimers() {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function stopScheduling() {
      clearTimers();
    }

    async function tryRefresh(): Promise<boolean> {
      const storedAuth = localStorage.getItem('auth');
      const parsed = storedAuth ? JSON.parse(storedAuth) : {};
      const rt = refreshToken ?? parsed.refreshToken;
      const userId = currentUser?.id ?? parsed?.user?.id;
      if (!rt || !userId) return false;
      try {
        const res = await refresh({ userId, refreshToken: rt }).unwrap();
        const newAuth = {
          user: parsed.user ?? currentUser,
          token: res.accessToken,
          refreshToken: res.refreshToken,
        };
        localStorage.setItem('auth', JSON.stringify(newAuth));
        // Update Redux credentials so UI and headers reflect new token
        dispatch(
          setCredentials({
            user: newAuth.user,
            token: newAuth.token,
            refreshToken: newAuth.refreshToken,
          })
        );
        return true;
      } catch {
        return false;
      }
    }

    function scheduleFromToken() {
      clearTimers();
      // Prefer Redux state, fallback to localStorage
      let token: string | undefined | null = accessToken;
      if (!token) {
        const storedAuth = localStorage.getItem('auth');
        token = storedAuth ? (JSON.parse(storedAuth).token as string | undefined) : undefined;
      }
      const expiryMs = decodeJwtExpiryMs(token ?? null);
      const now = Date.now();
      if (!expiryMs || expiryMs <= now) {
        // Token missing or expired; attempt refresh first
        if (token || refreshToken) {
          void (async () => {
            const ok = await tryRefresh();
            if (!ok) stopScheduling();
            else scheduleFromToken();
          })();
        }
        return;
      }
      const wait = Math.max(0, expiryMs - now);
      timeoutRef.current = window.setTimeout(async () => {
        const ok = await tryRefresh();
        
        if (!ok) stopScheduling();
        else scheduleFromToken();
      }, wait);
      // Additionally, poll in case localStorage changes without reload (refresh, cross-tab)
      intervalRef.current = window.setInterval(() => {
        const updated = localStorage.getItem('auth');
        const t = accessToken ?? (updated ? (JSON.parse(updated).token as string | undefined) : undefined);
        const e = decodeJwtExpiryMs(t ?? null);
        if (!e || e <= Date.now()) {
          // Will be handled by timeout or next scheduling; no-op here
        }
      }, CHECK_INTERVAL_MS);
    }

    scheduleFromToken();

    function onStorage(e: StorageEvent) {
      if (e.key === 'auth') {
        scheduleFromToken();
      }
    }
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearTimers();
    };
    // Reschedule when access or refresh token changes
  }, [dispatch, accessToken, refreshToken]);

  return null;
}


