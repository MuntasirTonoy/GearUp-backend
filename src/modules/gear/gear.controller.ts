import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { GearService } from './gear.service';
import { ImageUploadService } from '../imageUpload/imageUpload.service';
import httpStatus from 'http-status';
import { IGearFilters } from './gear.interface';

const createGear = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // Parse JSON body fields from multipart form-data
  const payload = {
    name: req.body.name,
    description: req.body.description,
    dailyRentalPrice: Number(req.body.dailyRentalPrice),
    quantity: Number(req.body.quantity),
    categoryId: req.body.categoryId,
    images: [] as string[],
  };

  // Upload images to Cloudinary
  const files = req.files as Express.Multer.File[] | undefined;
  if (files && files.length > 0) {
    const uploaded = await ImageUploadService.uploadMultipleImages(
      files,
      'gearup/gears'
    );
    payload.images = uploaded.map((img) => img.url);
  }

  const result = await GearService.createGear(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Gear listing created successfully',
    data: result,
  });
});

const getAllGears = catchAsync(async (req: Request, res: Response) => {
  const filters: IGearFilters = {
    searchTerm: req.query.searchTerm as string,
    categoryId: req.query.categoryId as string,
    status: req.query.status as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };

  const result = await GearService.getAllGears(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gears retrieved successfully',
    data: result.data,
    meta: result.meta,
  } as any);
});

const getMyGears = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error('User not found');
  }

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await GearService.getMyGears(userId, page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My gears retrieved successfully',
    data: result.data,
    meta: result.meta,
  } as any);
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await GearService.getGearById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear details retrieved successfully',
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id;
  const userRole = req.user?.role;

  // Build payload from form-data
  const payload: Record<string, any> = {};
  if (req.body.name) payload.name = req.body.name;
  if (req.body.description) payload.description = req.body.description;
  if (req.body.dailyRentalPrice) payload.dailyRentalPrice = Number(req.body.dailyRentalPrice);
  if (req.body.quantity) payload.quantity = Number(req.body.quantity);
  if (req.body.status) payload.status = req.body.status;
  if (req.body.categoryId) payload.categoryId = req.body.categoryId;

  // Upload new images if provided
  const files = req.files as Express.Multer.File[] | undefined;
  if (files && files.length > 0) {
    const uploaded = await ImageUploadService.uploadMultipleImages(
      files,
      'gearup/gears'
    );
    payload.images = uploaded.map((img) => img.url);
  }

  const result = await GearService.updateGear(id, userId, userRole, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear listing updated successfully',
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  await GearService.deleteGear(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear listing deleted successfully',
    data: null,
  });
});

export const GearController = {
  createGear,
  getAllGears,
  getMyGears,
  getGearById,
  updateGear,
  deleteGear,
};
