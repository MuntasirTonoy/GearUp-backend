import { Role } from '@prisma/client';

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  businessName?: string;
  description?: string;
  address?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  accessToken: string;
  refreshToken: string;
}
