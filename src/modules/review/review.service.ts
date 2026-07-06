import { prisma } from '../../lib/prisma';
import { ICreateReview } from './review.interface';
import httpStatus from 'http-status';

const createReview = async (userId: string, payload: ICreateReview) => {
  const completedRental = await prisma.rental.findFirst({
    where: {
      customerId: userId,
      gearId: payload.gearId,
      status: {
        in: ['PAID', 'COMPLETED'],
      },
    },
  });

  if (!completedRental) {
    const error: any = new Error('You can only review gear you have successfully rented and completed/paid for.');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      gearId: payload.gearId,
    },
  });

  if (existingReview) {
    const error: any = new Error('You have already reviewed this gear.');
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  const review = await prisma.review.create({
    data: {
      ...payload,
      userId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return review;
};

const getReviewsByGearId = async (gearId: string) => {
  const reviews = await prisma.review.findMany({
    where: { gearId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews;
};

const getFeaturedReviews = async () => {
  const reviews = await prisma.review.findMany({
    where: { rating: { gte: 4 } },
    include: {
      user: {
        select: {
          name: true,
          profilePhoto: true,
        },
      },
      gear: {
        select: {
          name: true,
        },
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return reviews;
};

const deleteReview = async (id: string, userId: string, userRole: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    const error: any = new Error('Review not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (userRole === 'CUSTOMER' && review.userId !== userId) {
    const error: any = new Error('You are not authorized to delete this review');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  await prisma.review.delete({
    where: { id },
  });

  return null;
};

export const ReviewService = {
  createReview,
  getReviewsByGearId,
  getFeaturedReviews,
  deleteReview,
};
