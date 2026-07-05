import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { GearService } from './gear.service';
import httpStatus from 'http-status';
import { IGearFilters } from './gear.interface';

const createGear = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await GearService.createGear(userId, req.body);

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
  };

  const result = await GearService.getAllGears(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gears retrieved successfully',
    data: result,
  });
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GearService.getGearById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear details retrieved successfully',
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  const result = await GearService.updateGear(id, userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear listing updated successfully',
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
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
  getGearById,
  updateGear,
  deleteGear,
};
