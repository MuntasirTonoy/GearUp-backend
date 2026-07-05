import { Router } from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/me', auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), UserController.getMyProfile);
router.patch('/me', auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), UserController.updateMyProfile);
router.get('/:id', UserController.getPublicProfile);

export const UserRoutes = router;
