import multer from 'multer';

// Keep uploads in memory so they can be sent to Cloudinary (or stored as base64).
// Nothing is written to disk, which keeps this compatible with Vercel.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const err = new Error('Only image files are allowed');
      err.status = 400;
      cb(err);
    }
  },
});

// Accepts a single file in the "image" form field
export const uploadSingleImage = upload.single('image');
