import crypto from 'crypto';

// Six-digit numeric one-time code
export const generateOtp = () => String(crypto.randomInt(100000, 1000000));

// OTPs are stored as HMAC hashes, never in plain text
export const hashOtp = (code) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(code).digest('hex');
