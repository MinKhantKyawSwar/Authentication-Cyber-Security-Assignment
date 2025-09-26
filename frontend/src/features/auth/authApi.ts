import { baseApi } from "@/app/baseApi";
import { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<void, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    googleLogin: builder.mutation<
      LoginResponse,
      { authCode?: string; idToken?: string }
    >({
      query: (body) => ({
        url: "/auth/google",
        method: "POST",
        body,
      }),
    }),
    resendOtp: builder.mutation<{ message: string }, { userId: string }>({
      query: (body) => ({ url: "/auth/resend-otp", method: "POST", body }),
    }),
    refresh: builder.mutation<
      { accessToken: string },
      { userId: string }
    >({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<LoginResponse, { email: string; code: string }>(
      {
        query: (body) => ({
          url: "/auth/verify-otp",
          method: "POST",
          body,
        }),
      },
    ),
    logoutServer: builder.mutation<void, { userId: string }>({
      query: (body) => ({ url: "/auth/logout", method: "POST", body }),
    }),
    getCurrentUser: builder.query<{ name: string; email: string }, void>({
      query: () => "/auth/whoami",
    }),
    listSessions: builder.query<
      Array<{
        id: string;
        revoked: boolean;
        createdAt: string;
        expiresAt: string;
        userAgent?: string;
        ip?: string;
      }>,
      void
    >({
      query: () => "/auth/sessions",
    }),
    revokeSession: builder.mutation<{ message: string }, { sessionId: string }>(
      {
        query: (body) => ({
          url: "/auth/sessions/revoke",
          method: "POST",
          body,
        }),
      },
    ),
    securityAudits: builder.query<
      Array<{
        type: string;
        at: string;
        deviceInfo?: string;
        ipAddress?: string;
      }>,
      void
    >({
      query: () => "/auth/security-audit",
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useResendOtpMutation,
  useRefreshMutation,
  useGoogleLoginMutation,
  useLogoutServerMutation,
  useGetCurrentUserQuery,
  useListSessionsQuery,
  useRevokeSessionMutation,
  useSecurityAuditsQuery,
} = authApi;
