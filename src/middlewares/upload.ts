import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

// ─── Allowed MIME types ───
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

// ─── Allowed file extensions (backup check) ───
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

// ─── Max file size: 5 MB ───
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Memory storage — no temp files on disk.
 * Buffers go straight from multer → Cloudinary stream.
 */
const storage: StorageEngine = multer.memoryStorage();

/**
 * File filter that validates both MIME type and extension.
 * Rejects non-image files with a descriptive error message.
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, AVIF`
      )
    );
    return;
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    cb(
      new Error(
        `Invalid file extension: ${ext}. Allowed extensions: .jpg, .jpeg, .png, .webp, .avif`
      )
    );
    return;
  }

  cb(null, true);
};

/**
 * Base multer instance with memory storage, file filter, and size limit.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // hard ceiling for any route
  },
});

/**
 * Middleware for uploading a single image.
 * @param fieldName - The form field name (e.g. 'image', 'profilePhoto')
 */
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

/**
 * Middleware for uploading multiple images.
 * @param fieldName - The form field name (e.g. 'images')
 * @param maxCount  - Maximum number of files (default: 5)
 */
export const uploadMultiple = (fieldName: string, maxCount: number = 5) =>
  upload.array(fieldName, maxCount);

export default upload;
