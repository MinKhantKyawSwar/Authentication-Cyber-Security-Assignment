export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken?: string;
  loginAttempts: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
}
