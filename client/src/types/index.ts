export type UserRole = 'INFLUENCER' | 'BRAND' | 'ADMIN';

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Material symbol name
  badge?: string | number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
