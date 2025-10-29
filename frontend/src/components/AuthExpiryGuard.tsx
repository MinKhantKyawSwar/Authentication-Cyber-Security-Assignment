import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentToken,
  selectCurrentUser,
  setCredentials,
} from "@/features/auth/authSlice";
import { decodeJwtExpiryMs } from "@/hooks/use-token-countdown";
import { useRefreshMutation } from "@/features/auth/authApi";

const CHECK_INTERVAL_MS = 5000; // check every 5 seconds

export default function AuthExpiryGuard() {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectCurrentToken);
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

    async function tryRefresh(): Promise<boolean> {
      const storedAuth = localStorage.getItem("auth");
      const parsed = storedAuth ? JSON.parse(storedAuth) : {};
      const userId = currentUser?.id ?? parsed?.user?.id;
      if (!userId) return false;

      try {
        const res = await refresh({ userId }).unwrap();
        const newAuth = {
          user: parsed.user ?? currentUser,
          token: res.accessToken,
        };
        localStorage.setItem("auth", JSON.stringify(newAuth));

        dispatch(
          setCredentials({
            user: newAuth.user,
            token: newAuth.token,
          }),
        );

        return true;
      } catch {
        console.warn("Token refresh failed.");
        return false;
      }
    }

    function scheduleFromToken() {
      clearTimers();

      // Prefer Redux token, fallback to localStorage
      let token: string | undefined | null = accessToken;
      if (!token) {
        const storedAuth = localStorage.getItem("auth");
        token = storedAuth
          ? (JSON.parse(storedAuth).token as string | undefined)
          : undefined;
      }

      const expiryMs = decodeJwtExpiryMs(token ?? null);
      const now = Date.now();

      // If no expiry or already expired → refresh immediately
      if (!expiryMs || expiryMs <= now) {
        void (async () => {
          const ok = await tryRefresh();
          if (ok) scheduleFromToken();
          else {
            // Retry after a short delay (in case of network issues)
            timeoutRef.current = window.setTimeout(scheduleFromToken, 10000);
          }
        })();
        return;
      }

      const wait = Math.max(0, expiryMs - now);
      console.debug("Next token refresh scheduled in", wait / 1000, "seconds");

      // Schedule a refresh exactly when token expires
      timeoutRef.current = window.setTimeout(async () => {
        const ok = await tryRefresh();
        if (ok) scheduleFromToken();
        else timeoutRef.current = window.setTimeout(scheduleFromToken, 10000);
      }, wait);

      // Periodically check for token expiry or cross-tab changes
      intervalRef.current = window.setInterval(() => {
        const updatedAuth = localStorage.getItem("auth");
        const updatedToken = updatedAuth
          ? (JSON.parse(updatedAuth).token as string | undefined)
          : undefined;
        const exp = decodeJwtExpiryMs(updatedToken ?? null);
        if (!exp || exp <= Date.now()) {
          console.debug("Detected expired token, refreshing...");
          void (async () => {
            const ok = await tryRefresh();
            if (ok) scheduleFromToken();
          })();
        }
      }, CHECK_INTERVAL_MS);
    }

    // React to localStorage changes (multi-tab sync)
    function onStorage(e: StorageEvent) {
      if (e.key === "auth") {
        scheduleFromToken();
      }
    }

    scheduleFromToken();
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearTimers();
    };
  }, [dispatch, accessToken, currentUser, refresh]);

  return null;
}
