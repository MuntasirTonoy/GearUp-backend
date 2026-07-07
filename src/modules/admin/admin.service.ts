import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isDeleted: true,
      isSuspended: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return users;
};

const toggleUserBlock = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isSuspended: !user.isSuspended }, // Toggle: block if active, unblock if blocked
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isSuspended: true,
    },
  });

  return updatedUser;
};

const getProviderRequests = async () => {
  const providers = await prisma.provider.findMany({
    where: { approved: false },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return providers;
};

const approveProvider = async (id: string) => {
  const provider = await prisma.provider.findUnique({
    where: { id },
  });

  if (!provider) {
    const error: any = new Error("Provider not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const updatedProvider = await prisma.provider.update({
    where: { id },
    data: { approved: true },
  });

  return updatedProvider;
};

const getAllGears = async () => {
  const gears = await prisma.gear.findMany({
    include: {
      category: { select: { name: true } },
      provider: { select: { businessName: true } },
      _count: {
        select: { rentals: true, reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return gears;
};

const getAllRentals = async () => {
  const rentals = await prisma.rental.findMany({
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      gear: {
        select: {
          name: true,
          provider: {
            select: {
              businessName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return rentals;
};

const getAllPayments = async () => {
  const payments = await prisma.payment.findMany({
    include: {
      rental: {
        select: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          gear: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return payments;
};

export const AdminService = {
  getAllUsers,
  toggleUserBlock,
  getProviderRequests,
  approveProvider,
  getAllGears,
  getAllRentals,
  getAllPayments,
};
