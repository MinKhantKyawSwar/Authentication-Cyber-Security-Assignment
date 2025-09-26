import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "@/features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api",
  prepareHeaders: (headers) => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const { token } = JSON.parse(storedAuth);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (result.error && (result.error as any).status === 401) {
    const storedAuth = localStorage.getItem("auth");
    const parsed = storedAuth ? JSON.parse(storedAuth) : null;
    const userId = parsed?.user?.id as string | undefined;
    if (userId) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { userId },
        },
        api,
        extraOptions,
      );
      if (refreshResult.data) {
        const { accessToken } = refreshResult.data as any;
        const newAuth = {
          user: parsed.user,
          token: accessToken,
        };
        localStorage.setItem("auth", JSON.stringify(newAuth));
        try {
          api.dispatch(
            setCredentials({
              user: parsed.user,
              token: accessToken,
            })
          );
        } catch {}
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem("auth");
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
