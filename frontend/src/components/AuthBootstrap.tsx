import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentToken,
  selectCurrentUser,
  setCredentials,
  logout,
} from "@/features/auth/authSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { decodeJwtExpiryMs } from "@/hooks/use-token-countdown";

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  const expiryMs = decodeJwtExpiryMs(token);
  const isExpired = !expiryMs || expiryMs <= Date.now();

  const shouldFetchUser = !!token && !isExpired && !user;
  const { data, isSuccess } = useGetCurrentUserQuery(undefined, {
    skip: !shouldFetchUser,
  });

  useEffect(() => {
    // If token exists but already expired, logout immediately
    if (token && isExpired) {
      dispatch(logout());
      return;
    }
  }, [dispatch, token, isExpired]);

  useEffect(() => {
    if (isSuccess && data && token) {
      const stored = localStorage.getItem("auth");
      // const parsed = stored ? JSON.parse(stored) : {};
      dispatch(
        setCredentials({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          user: { name: data.name, email: data.email } as any,
          token,
        }),
      );
    }
  }, [isSuccess, data, dispatch, token]);

  return null;
}
