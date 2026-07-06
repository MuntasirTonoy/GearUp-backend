import { Router } from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { uploadSingle } from '../../middlewares/upload';

const router = Router();

router.get('/me', auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), UserController.getMyProfile);
router.patch('/me', auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), uploadSingle('profilePhoto'), UserController.updateMyProfile);
router.delete('/me', auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), UserController.deleteMyProfile);
router.get('/:id', UserController.getPublicProfile);

export const UserRoutes = router;
