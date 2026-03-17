export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
  modules: UserModule[];
  assignedCompanyIds: number[];
}

export interface UserModule {
  id: number;
  name: string;
  route: string;
  icon: string;
  parentId: number | null;
  displayOrder: number;
}
