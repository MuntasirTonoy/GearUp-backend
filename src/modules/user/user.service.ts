import { prisma } from '../../lib/prisma';
import { IUpdateUser } from './user.interface';
import httpStatus from 'http-status';

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return user;
};

const updateMyProfile = async (userId: string, payload: IUpdateUser) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const getPublicProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return user;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
};
