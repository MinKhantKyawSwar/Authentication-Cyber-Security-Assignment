import { baseApi } from '@/app/baseApi';
import { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<void, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    googleLogin: builder.mutation<LoginResponse, { authCode?: string; idToken?: string }>({
      query: (body) => ({
        url: '/auth/google',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<LoginResponse, { email: string; code: string }>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    logoutServer: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getCurrentUser: builder.query<{ name: string; email: string }, void>({
      query: () => '/auth/whoami',
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutServerMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGoogleLoginMutation,
  useVerifyOtpMutation,
} = authApi;
