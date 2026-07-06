import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from '../../lib/cloudinary.js';
import { IUploadedImage } from './imageUpload.interface.js';
import httpStatus from 'http-status';

/**
 * Upload a single image buffer to Cloudinary.
 */
const uploadSingleImage = async (
  file: Express.Multer.File,
  folder: string
): Promise<IUploadedImage> => {
  if (!file || !file.buffer) {
    const error: any = new Error('No file provided for upload');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const result = await uploadToCloudinary(file.buffer, { folder });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Upload multiple image buffers to Cloudinary concurrently.
 * Uses Promise.allSettled to handle partial failures gracefully.
 */
const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string
): Promise<IUploadedImage[]> => {
  if (!files || files.length === 0) {
    const error: any = new Error('No files provided for upload');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, { folder })
  );

  const results = await Promise.allSettled(uploadPromises);

  const uploaded: IUploadedImage[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      uploaded.push({
        url: result.value.secure_url,
        publicId: result.value.public_id,
      });
    } else {
      errors.push(`File ${index + 1}: ${result.reason?.message || 'Unknown error'}`);
    }
  });

  // If ALL uploads failed, throw an error
  if (uploaded.length === 0) {
    const error: any = new Error(
      `All uploads failed. Errors: ${errors.join('; ')}`
    );
    error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    throw error;
  }

  // If some uploads failed, log the errors but return what succeeded
  if (errors.length > 0) {
    console.warn(`Partial upload failure: ${errors.join('; ')}`);
  }

  return uploaded;
};

/**
 * Delete a single image from Cloudinary by its public_id or URL.
 */
const deleteImage = async (publicIdOrUrl: string): Promise<void> => {
  let publicId = publicIdOrUrl;

  // If it looks like a URL, extract the public_id
  if (publicIdOrUrl.startsWith('http')) {
    const extracted = extractPublicId(publicIdOrUrl);
    if (!extracted) {
      console.warn(`Could not extract public_id from URL: ${publicIdOrUrl}`);
      return;
    }
    publicId = extracted;
  }

  await deleteFromCloudinary(publicId);
};

/**
 * Delete multiple images from Cloudinary by their URLs.
 */
const deleteMultipleImages = async (urls: string[]): Promise<void> => {
  const deletePromises = urls.map((url) => deleteImage(url));
  await Promise.allSettled(deletePromises);
};

export const ImageUploadService = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};
