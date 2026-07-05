import { Router } from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', auth(Role.ADMIN), CategoryController.createCategory);
router.get('/', CategoryController.getAllCategories);
router.patch('/:id', auth(Role.ADMIN), CategoryController.updateCategory);
router.delete('/:id', auth(Role.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
