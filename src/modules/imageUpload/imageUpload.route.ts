import { Router } from 'express';
import { ImageUploadController } from './imageUpload.controller.js';
import auth from '../../middlewares/auth.js';
import { uploadSingle, uploadMultiple } from '../../middlewares/upload.js';

const router = Router();

// Any authenticated user can upload images
router.post(
  '/single',
  auth(),
  uploadSingle('image'),
  ImageUploadController.uploadSingle
);

router.post(
  '/multiple',
  auth(),
  uploadMultiple('images', 5),
  ImageUploadController.uploadMultiple
);

export const ImageUploadRoutes = router;
