import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
import httpStatus from "http-status";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await AdminService.getAllUsers(page, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  } as any);
});

const toggleUserBlock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await AdminService.toggleUserBlock(id);
  const action = result.isSuspended ? "blocked" : "unblocked";
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User ${action} successfully`,
    data: result,
  });
});

const getAllGears = catchAsync(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await AdminService.getAllGears(page, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All gear listings retrieved successfully",
    data: result.data,
    meta: result.meta,
  } as any);
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await AdminService.getAllRentals(page, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rentals retrieved successfully",
    data: result.data,
    meta: result.meta,
  } as any);
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllPayments();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  toggleUserBlock,
  getAllGears,
  getAllRentals,
  getAllPayments,
};
