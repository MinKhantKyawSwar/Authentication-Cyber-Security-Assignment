export interface User {
  id: string;
  name?: string;
  email: string;
  faceScanEnabled?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FaceScanLoginRequest {
  email: string;
  faceScanData: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
}

export interface FaceScanSetupRequest {
  faceScanData: string;
}

export interface FaceScanSetupResponse {
  success: boolean;
  message: string;
}
