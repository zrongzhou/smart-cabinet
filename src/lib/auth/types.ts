export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  company?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
