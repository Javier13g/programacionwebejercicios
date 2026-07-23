export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  tokenType?: string;
  id?: number;
  username?: string;
  rol?: string;
  expiresInMs?: number;
}
