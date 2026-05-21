// Centralized error handler.
// Routes can `throw new ApiError(400, 'message')` and it lands here.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Multer file size errors
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'ไฟล์ใหญ่เกินไป (สูงสุด 5 MB)' });
  }

  // Mongoose validation errors
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err && err.name === 'CastError') {
    return res.status(400).json({ error: 'รูปแบบ ID ไม่ถูกต้อง' });
  }

  // Our own API errors
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Unknown errors — log but don't leak details to client
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Unhandled error]', err);
  }
  res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
}

module.exports = { errorHandler, ApiError };
