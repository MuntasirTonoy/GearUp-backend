import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import config from '../config/index.js';
import { Readable } from 'stream';

// Configure Cloudinary singleton
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface ICloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Upload a buffer to Cloudinary using a stream.
 * Uses auto-format (f_auto), auto-quality (q_auto), and organizes by folder.
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  options: {
    folder: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: object[];
    publicId?: string;
  }
): Promise<ICloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType || 'image',
        public_id: options.publicId,
        transformation: options.transformation || [
          { quality: 'auto', fetch_format: 'auto' },
        ],
        overwrite: true,
        invalidate: true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(
            Object.assign(new Error(`Cloudinary upload failed: ${error.message}`), {
              statusCode: 500,
            })
          );
          return;
        }

        if (!result) {
          reject(
            Object.assign(new Error('Cloudinary upload returned no result'), {
              statusCode: 500,
            })
          );
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Pipe the buffer into the upload stream
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete an asset from Cloudinary by its public_id.
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ result: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result as { result: string };
  } catch {
    // Log but don't throw — cleanup failures shouldn't block the main operation
    console.error(`Failed to delete Cloudinary asset: ${publicId}`);
    return { result: 'error' };
  }
};

/**
 * Delete multiple assets from Cloudinary by their public_ids.
 */
export const deleteManyFromCloudinary = async (
  publicIds: string[],
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> => {
  if (publicIds.length === 0) return;

  try {
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch {
    console.error(`Failed to bulk delete Cloudinary assets: ${publicIds.join(', ')}`);
  }
};

/**
 * Extract the public_id from a Cloudinary secure_url.
 * Example: https://res.cloudinary.com/demo/image/upload/v1234/gearup/gears/abc123.webp
 * Returns: gearup/gears/abc123
 */
export const extractPublicId = (secureUrl: string): string | null => {
  try {
    const url = new URL(secureUrl);
    const pathParts = url.pathname.split('/upload/');
    if (pathParts.length < 2) return null;

    // Remove version prefix (v1234567890/) and file extension
    const afterUpload = pathParts[1]!;
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const withoutExtension = withoutVersion.replace(/\.[^.]+$/, '');

    return withoutExtension;
  } catch {
    return null;
  }
};

export default cloudinary;
