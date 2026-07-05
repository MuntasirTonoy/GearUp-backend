import { prisma } from '../../lib/prisma';
import { ICreateProvider, IUpdateProvider } from './provider.interface';
import httpStatus from 'http-status';

const createProvider = async (userId: string, payload: ICreateProvider) => {
  const existingProvider = await prisma.provider.findUnique({
    where: { userId },
  });

  if (existingProvider) {
    const error: any = new Error('Provider profile already exists for this user');
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  const provider = await prisma.provider.create({
    data: {
      userId,
      ...payload,
    },
  });

  return provider;
};

const getApprovedProviders = async () => {
  const providers = await prisma.provider.findMany({
    where: { approved: true },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return providers;
};

const getProviderById = async (id: string) => {
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      gears: true, // Also fetch the provider's gear listings
    },
  });

  if (!provider) {
    const error: any = new Error('Provider not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return provider;
};

const updateProvider = async (id: string, userId: string, userRole: string, payload: IUpdateProvider) => {
  const provider = await prisma.provider.findUnique({
    where: { id },
  });

  if (!provider) {
    const error: any = new Error('Provider not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  // Check authorization: PROVIDER can only update their own profile. ADMIN can update any.
  if (userRole === 'PROVIDER' && provider.userId !== userId) {
    const error: any = new Error('You are not authorized to update this provider profile');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const updatedProvider = await prisma.provider.update({
    where: { id },
    data: payload,
  });

  return updatedProvider;
};

export const ProviderService = {
  createProvider,
  getApprovedProviders,
  getProviderById,
  updateProvider,
};
