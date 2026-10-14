import { v2 as cloudinary } from 'cloudinary';

const cloudinaryEnabled = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

// Uploads an image from multer's memory buffer and returns a URL.
// - With Cloudinary configured: uploads and returns the secure URL (recommended for production).
// - Otherwise: returns a base64 data URL that is stored directly in MongoDB (fine for demos).
export async function uploadImage(file) {
  if (!file) return '';

  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  if (!cloudinaryEnabled()) return dataUrl;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const result = await cloudinary.uploader.upload(dataUrl, { folder: 'glassify-canteen' });
  return result.secure_url;
}
