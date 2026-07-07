import { prisma } from '../../lib/prisma';
import { ICreateGear, IUpdateGear, IGearFilters } from './gear.interface';
import { ImageUploadService } from '../imageUpload/imageUpload.service';
import httpStatus from 'http-status';
import { getPaginationParams, buildMeta } from '../../utils/paginate';

const createGear = async (userId: string, payload: ICreateGear) => {
  const provider = await prisma.provider.findUnique({
    where: { userId },
  });

  if (!provider) {
    const error: any = new Error('Provider profile not found. Please create a provider profile first.');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  
  if (!provider.approved) {
    const error: any = new Error('Your provider profile is not yet approved by an admin.');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const gear = await prisma.gear.create({
    data: {
      ...payload,
      providerId: provider.id,
    },
  });

  return gear;
};

const getAllGears = async (filters: IGearFilters) => {
  const { searchTerm, categoryId, status, minPrice, maxPrice, page: rawPage, limit: rawLimit } = filters;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (categoryId) {
    andConditions.push({ categoryId });
  }

  if (status) {
    andConditions.push({ status });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.gte = Number(minPrice);
    if (maxPrice !== undefined) priceCondition.lte = Number(maxPrice);
    andConditions.push({ dailyRentalPrice: priceCondition });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const { page, limit, skip } = getPaginationParams(rawPage, rawLimit, 12);

  const [gears, total] = await Promise.all([
    prisma.gear.findMany({
      where: whereConditions,
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.gear.count({ where: whereConditions }),
  ]);

  return { data: gears, meta: buildMeta(page, limit, total) };
};

const getMyGears = async (userId: string, rawPage?: number, rawLimit?: number) => {
  const provider = await prisma.provider.findUnique({
    where: { userId },
  });

  if (!provider) {
    const error: any = new Error('Provider profile not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const { page, limit, skip } = getPaginationParams(rawPage, rawLimit, 10);

  const [gears, total] = await Promise.all([
    prisma.gear.findMany({
      where: { providerId: provider.id },
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.gear.count({ where: { providerId: provider.id } }),
  ]);

  return { data: gears, meta: buildMeta(page, limit, total) };
};

const getGearById = async (id: string) => {
  const gear = await prisma.gear.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          businessName: true,
          address: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            }
          }
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!gear) {
    const error: any = new Error('Gear not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return gear;
};

const updateGear = async (id: string, userId: string, userRole: string, payload: IUpdateGear) => {
  const gear = await prisma.gear.findUnique({
    where: { id },
    include: {
      provider: true,
    },
  });

  if (!gear) {
    const error: any = new Error('Gear not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (userRole === 'PROVIDER' && gear.provider.userId !== userId) {
    const error: any = new Error('You are not authorized to update this gear listing');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  // If new images are provided, clean up old Cloudinary images
  if (payload.images && payload.images.length > 0 && gear.images.length > 0) {
    // Fire-and-forget cleanup — don't block the update
    ImageUploadService.deleteMultipleImages(gear.images).catch((err) => {
      console.error('Failed to cleanup old gear images:', err);
    });
  }

  const updatedGear = await prisma.gear.update({
    where: { id },
    data: payload,
  });

  return updatedGear;
};

const deleteGear = async (id: string, userId: string, userRole: string) => {
  const gear = await prisma.gear.findUnique({
    where: { id },
    include: {
      provider: true,
    },
  });

  if (!gear) {
    const error: any = new Error('Gear not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (userRole === 'PROVIDER' && gear.provider.userId !== userId) {
    const error: any = new Error('You are not authorized to delete this gear listing');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  // Clean up Cloudinary images before deleting the gear
  if (gear.images.length > 0) {
    ImageUploadService.deleteMultipleImages(gear.images).catch((err) => {
      console.error('Failed to cleanup gear images on delete:', err);
    });
  }

  await prisma.gear.delete({
    where: { id },
  });

  return null;
};

export const GearService = {
  createGear,
  getAllGears,
  getMyGears,
  getGearById,
  updateGear,
  deleteGear,
};
