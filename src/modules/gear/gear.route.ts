import { Router } from 'express';
import { GearController } from './gear.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { uploadMultiple } from '../../middlewares/upload';

const router = Router();

router.post('/', auth(Role.PROVIDER), uploadMultiple('images', 5), GearController.createGear);
router.get('/', GearController.getAllGears);
router.get('/:id', GearController.getGearById);
router.patch('/:id', auth(Role.PROVIDER, Role.ADMIN), uploadMultiple('images', 5), GearController.updateGear);
router.delete('/:id', auth(Role.PROVIDER, Role.ADMIN), GearController.deleteGear);

export const GearRoutes = router;
