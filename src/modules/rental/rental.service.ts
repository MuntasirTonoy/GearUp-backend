import { prisma } from "../../lib/prisma";
import { ICreateRental, IUpdateRentalStatus } from "./rental.interface";
import httpStatus from "http-status";
import { getPaginationParams, buildMeta } from "../../utils/paginate";

const createRental = async (customerId: string, payload: ICreateRental) => {
  const gear = await prisma.gear.findUnique({
    where: { id: payload.gearId },
  });

  if (!gear) {
    const error: any = new Error("Gear not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (gear.status !== "AVAILABLE") {
    const error: any = new Error("Gear is not available for rental");
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);

  if (start >= end) {
    const error: any = new Error("End date must be after start date");
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
      status: "PLACED",
    },
    include: {
      gear: {
        select: { name: true, images: true, dailyRentalPrice: true },
      },
    },
  });

  return rental;
};

const getMyRentals = async (customerId: string, rawPage?: number, rawLimit?: number) => {
  const { page, limit, skip } = getPaginationParams(rawPage, rawLimit, 10);

  const [rentals, total] = await Promise.all([
    prisma.rental.findMany({
      where: { customerId },
      include: {
        gear: {
          select: {
            name: true,
            images: true,
            dailyRentalPrice: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.rental.count({ where: { customerId } }),
  ]);

  return { data: rentals, meta: buildMeta(page, limit, total) };
};

const getRentalById = async (
  rentalId: string,
  userId: string,
  userRole: string,
) => {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: {
      gear: {
        include: {
          category: true,
          provider: {
            select: { businessName: true, address: true },
          },
        },
      },
      customer: {
        select: { name: true, email: true, phone: true },
      },
      payment: true,
    },
  });

  if (!rental) {
    const error: any = new Error("Rental not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const isCustomer = rental.customerId === userId;
  const isAdmin = userRole === "ADMIN";

  const isProvider = userRole === "PROVIDER";

  if (!isCustomer && !isAdmin && !isProvider) {
    const error: any = new Error("You are not authorized to view this rental");
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  return rental;
};

const getProviderRentals = async (providerUserId: string, rawPage?: number, rawLimit?: number) => {
  const provider = await prisma.provider.findUnique({
    where: { userId: providerUserId },
  });

  if (!provider) {
    const error: any = new Error("Provider profile not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const whereConditions = { gear: { providerId: provider.id } };
  const { page, limit, skip } = getPaginationParams(rawPage, rawLimit, 10);

  const [rentals, total] = await Promise.all([
    prisma.rental.findMany({
      where: whereConditions,
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
            images: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.rental.count({ where: whereConditions }),
  ]);

  return { data: rentals, meta: buildMeta(page, limit, total) };
};

const cancelRental = async (rentalId: string, customerId: string) => {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
  });

  if (!rental) {
    const error: any = new Error("Rental not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (rental.customerId !== customerId) {
    const error: any = new Error(
      "You are not authorized to cancel this rental",
    );
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  if (rental.status !== "PLACED") {
    const error: any = new Error(
      `Cannot cancel a rental that is already ${rental.status}. Only PLACED rentals can be cancelled.`,
    );
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const updatedRental = await prisma.rental.update({
    where: { id: rentalId },
    data: { status: "CANCELLED" },
  });

  return updatedRental;
};

const updateRentalStatus = async (
  rentalId: string,
  userId: string,
  userRole: string,
  payload: IUpdateRentalStatus,
) => {
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
    const error: any = new Error("Rental not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (userRole === "PROVIDER" && rental.gear.provider.userId !== userId) {
    const error: any = new Error(
      "You are not authorized to update this rental status",
    );
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    PLACED: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PICKED_UP", "CANCELLED"],
    PAID: ["PICKED_UP", "CANCELLED"],
    PICKED_UP: ["RETURNED"],
  };

  const allowedNext = validTransitions[rental.status];
  if (!allowedNext || !allowedNext.includes(payload.status)) {
    const error: any = new Error(
      `Invalid status transition from ${rental.status} to ${payload.status}. Allowed: ${allowedNext?.join(", ") ?? "none"}`,
    );
    error.statusCode = httpStatus.BAD_REQUEST;
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
  getRentalById,
  getProviderRentals,
  cancelRental,
  updateRentalStatus,
};
