import { Router } from 'express';
import { RentalController } from './rental.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', auth(Role.CUSTOMER), RentalController.createRental);
router.get('/my-rentals', auth(Role.CUSTOMER), RentalController.getMyRentals);
router.get('/provider', auth(Role.PROVIDER), RentalController.getProviderRentals);
router.patch('/:id/status', auth(Role.PROVIDER, Role.ADMIN), RentalController.updateRentalStatus);

export const RentalRoutes = router;
