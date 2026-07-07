import { prisma } from '../../lib/prisma';
import { ICreateCategory, IUpdateCategory } from './category.interface';
import httpStatus from 'http-status';

const createCategory = async (payload: ICreateCategory) => {
  const existingCategory = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existingCategory) {
    const error: any = new Error('Category already exists');
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }

  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { gears: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return categories;
};

const updateCategory = async (id: string, payload: IUpdateCategory) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    const error: any = new Error('Category not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    const error: any = new Error('Category not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  await prisma.category.delete({
    where: { id },
  });

  return null;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
