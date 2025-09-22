import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api',
    prepareHeaders: (headers) => {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const { token } = JSON.parse(storedAuth);
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
    credentials: 'include',
  }),
  endpoints: () => ({}),
});
