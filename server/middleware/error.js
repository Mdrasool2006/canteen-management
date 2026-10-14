export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Central error handler: turns library errors into readable JSON responses
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 3MB or smaller' : err.message;
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID';
  }
  if (err.code === 11000) {
    status = 409;
    message = 'A record with this email or phone already exists';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({ message });
}
