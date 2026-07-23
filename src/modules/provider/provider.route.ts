import { Router } from 'express';
import { ProviderController } from './provider.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', auth(Role.PROVIDER), ProviderController.createProvider);
router.get('/', ProviderController.getAllProviders);
router.get('/:id', ProviderController.getProviderById);
router.patch('/:id', auth(Role.PROVIDER, Role.ADMIN), ProviderController.updateProvider);

export const ProviderRoutes = router;
