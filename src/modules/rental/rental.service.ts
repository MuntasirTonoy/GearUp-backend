import { prisma } from '../../lib/prisma';
import { ICreateRental, IUpdateRentalStatus } from './rental.interface';
import httpStatus from 'http-status';

const createRental = async (customerId: string, payload: ICreateRental) => {
  const gear = await prisma.gear.findUnique({
    where: { id: payload.gearId },
  });

  if (!gear) {
    const error: any = new Error('Gear not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (gear.status !== 'AVAILABLE') {
    const error: any = new Error('Gear is not available for rental');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);
  
  if (start >= end) {
    const error: any = new Error('End date must be after start date');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const totalAmount = diffDays * gear.dailyRentalPrice;

  const rental = await prisma.rental.create({
    data: {
      customerId,
      gearId: payload.gearId,
      startDate: start,
      endDate: end,
      totalDays: diffDays,
      totalAmount,
      status: 'PENDING',
    },
  });

  return rental;
};

const getMyRentals = async (customerId: string) => {
  const rentals = await prisma.rental.findMany({
    where: { customerId },
    include: {
      gear: {
        select: {
          name: true,
          image: true,
          dailyRentalPrice: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return rentals;
};

const getProviderRentals = async (providerUserId: string) => {
  const provider = await prisma.provider.findUnique({
    where: { userId: providerUserId },
  });

  if (!provider) {
    const error: any = new Error('Provider profile not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const rentals = await prisma.rental.findMany({
    where: {
      gear: {
        providerId: provider.id,
      },
    },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      gear: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rentals;
};

const updateRentalStatus = async (rentalId: string, userId: string, userRole: string, payload: IUpdateRentalStatus) => {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: {
      gear: {
        include: {
          provider: true,
        },
      },
    },
  });

  if (!rental) {
    const error: any = new Error('Rental not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (userRole === 'PROVIDER' && rental.gear.provider.userId !== userId) {
    const error: any = new Error('You are not authorized to update this rental status');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const updatedRental = await prisma.rental.update({
    where: { id: rentalId },
    data: { status: payload.status },
  });

  return updatedRental;
};

export const RentalService = {
  createRental,
  getMyRentals,
  getProviderRentals,
  updateRentalStatus,
};
