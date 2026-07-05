import { Router } from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', auth(Role.CUSTOMER), ReviewController.createReview);
router.get('/gear/:gearId', ReviewController.getReviewsByGearId);
router.delete('/:id', auth(Role.CUSTOMER, Role.ADMIN), ReviewController.deleteReview);

export const ReviewRoutes = router;
