import { prisma } from '../../lib/prisma';
import { IUpdateUser } from './user.interface';
import { ImageUploadService } from '../imageUpload/imageUpload.service';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePhoto: true,
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

  // If a new profile photo is being set, clean up the old one from Cloudinary
  if (payload.profilePhoto && user.profilePhoto) {
    ImageUploadService.deleteImage(user.profilePhoto).catch((err) => {
      console.error('Failed to cleanup old profile photo:', err);
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePhoto: true,
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
      profilePhoto: true,
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

const deleteMyProfile = async (userId: string, password?: string) => {
  if (!password) {
    const error: any = new Error('Password is required to delete account');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    const error: any = new Error('Incorrect password');
    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isDeleted: true },
  });

  return null;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  deleteMyProfile,
};
