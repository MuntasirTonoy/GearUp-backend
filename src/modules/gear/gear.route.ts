import { Router } from 'express';
import { GearController } from './gear.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', auth(Role.PROVIDER), GearController.createGear);
router.get('/', GearController.getAllGears);
router.get('/:id', GearController.getGearById);
router.patch('/:id', auth(Role.PROVIDER, Role.ADMIN), GearController.updateGear);
router.delete('/:id', auth(Role.PROVIDER, Role.ADMIN), GearController.deleteGear);

export const GearRoutes = router;
