export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  id: number;
  username: string;
  rol: string;
  token: string;
  tokenType: string;
  expiresInMs: number;
}
