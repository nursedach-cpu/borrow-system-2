// Upload storage abstraction.
//
// Two modes, swappable via env:
//   • CLOUDINARY_URL set → uploads go to Cloudinary (persists across deploys)
//   • otherwise        → local disk (fine for dev, files vanish on Render redeploy)
//
// Routes always call `upload.single('image')` then `getPublicUrl(req.file)`
// without caring which backend is active.

const multer = require('multer');
const path = require('path');
const { UPLOAD } = require('../constants');

const useCloudinary = Boolean(process.env.CLOUDINARY_URL);

function fileFilter(req, file, cb) {
  if (UPLOAD.ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPG / PNG / WEBP / GIF)'));
  }
}

let upload;
let getPublicUrl;

if (useCloudinary) {
  // eslint-disable-next-line global-require
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({ secure: true });

  // Buffer the upload in memory, then stream to Cloudinary.
  // For 5 MB max files this is fine — much simpler than implementing a custom
  // multer StorageEngine class.
  const memUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
    fileFilter,
  });

  function streamToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'borrow-system', resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });
  }

  // Wrap multer so req.file gets a `.url` field after Cloudinary uploads.
  upload = {
    single(fieldName) {
      return [
        memUpload.single(fieldName),
        async (req, res, next) => {
          try {
            if (!req.file) return next();
            const result = await streamToCloudinary(req.file.buffer);
            req.file.url = result.secure_url;
            req.file.cloudinaryPublicId = result.public_id;
            next();
          } catch (err) {
            next(err);
          }
        },
      ];
    },
  };

  getPublicUrl = (file) => file.url;
} else {
  const diskUpload = multer({
    storage: multer.diskStorage({
      destination: path.join(__dirname, '..', 'uploads'),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
      },
    }),
    limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
    fileFilter,
  });

  upload = {
    single(fieldName) {
      return diskUpload.single(fieldName);
    },
  };

  getPublicUrl = (file) => `/uploads/${file.filename}`;
}

module.exports = { upload, getPublicUrl, useCloudinary };
