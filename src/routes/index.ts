import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { ProviderRoutes } from '../modules/provider/provider.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { GearRoutes } from '../modules/gear/gear.route';
import { RentalRoutes } from '../modules/rental/rental.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { ImageUploadRoutes } from '../modules/imageUpload/imageUpload.route';
import { SettingsRoutes } from '../modules/settings/settings.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/providers', route: ProviderRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/gears', route: GearRoutes },
  { path: '/rentals', route: RentalRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/upload', route: ImageUploadRoutes },
  { path: '/settings', route: SettingsRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
