import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { IRegisterUser, ILoginUser, IAuthResponse } from './auth.interface';
import httpStatus from 'http-status';
import { createToken, verifyToken } from '../../utils/jwt';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from '@prisma/client';

const registerUser = async (payload: IRegisterUser): Promise<IAuthResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    const error: any = new Error('User with this email already exists');
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  if (payload.role === Role.ADMIN) {
     const error: any = new Error('Cannot register as ADMIN directly');
     error.statusCode = httpStatus.FORBIDDEN;
     throw error;
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  const jwtPayload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.accessSecret,
    config.jwt.accessExpiresIn
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn
  );

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUser): Promise<IAuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user || user.isDeleted) {
    const error: any = new Error('User not found or deleted');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    const error: any = new Error('Incorrect password');
    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.accessSecret,
    config.jwt.accessExpiresIn
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decoded;
  try {
    decoded = verifyToken(token, config.jwt.refreshSecret) as JwtPayload;
  } catch (err) {
    const error: any = new Error('Invalid or expired refresh token');
    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.isDeleted) {
    const error: any = new Error('User not found or deleted');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.accessSecret,
    config.jwt.accessExpiresIn
  );

  return { accessToken };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
};
