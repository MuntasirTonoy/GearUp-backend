import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { getPaginationParams, buildMeta } from "../../utils/paginate";

const getAllUsers = async (rawPage?: number, rawLimit?: number) => {
  const { page, limit, skip } = getPaginationParams(rawPage, rawLimit, 10);

  const [users, total, customerCount, providerCount, suspendedCount] = await Promise.all([
    prisma.user.findMany({
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
      skip,
      take: limit,
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { isSuspended: true } }),
  ]);

  return {
    data: users,
    meta: {
      ...buildMeta(page, limit, total),
      customerCount,
      providerCount,
      suspendedCount,
    },
  };
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

const getAllGears = async (rawPage?: number, rawLimit?: number) => {
  const { page, limit, skip } = getPaginationParams(rawPage, rawLimit, 10);

  const [gears, total] = await Promise.all([
    prisma.gear.findMany({
      include: {
        category: { select: { name: true } },
        provider: { select: { businessName: true } },
        _count: {
          select: { rentals: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.gear.count(),
  ]);

  return { data: gears, meta: buildMeta(page, limit, total) };
};

const getAllRentals = async (rawPage?: number, rawLimit?: number) => {
  const { page, limit, skip } = getPaginationParams(rawPage, rawLimit, 10);

  const [rentals, total] = await Promise.all([
    prisma.rental.findMany({
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
            images: true,
            provider: {
              select: {
                businessName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.rental.count(),
  ]);

  return { data: rentals, meta: buildMeta(page, limit, total) };
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
