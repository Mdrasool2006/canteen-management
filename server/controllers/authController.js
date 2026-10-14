import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import { parseIdentifier } from '../utils/identifier.js';
import { generateOtp, hashOtp } from '../utils/otp.js';
import { sendOtp } from '../utils/sendOtp.js';
import { signToken } from '../utils/token.js';

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// Generates a new OTP, stores its hash and sends it to the user
async function issueOtp(parsed) {
  const last = await Otp.findOne({ identifier: parsed.value }).sort({ createdAt: -1 });
  if (last) {
    const elapsed = Date.now() - last.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw httpError(429, `Please wait ${wait}s before requesting a new code`);
    }
  }

  await Otp.deleteMany({ identifier: parsed.value });
  const code = generateOtp();
  await Otp.create({
    identifier: parsed.value,
    codeHash: hashOtp(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  const channel = await sendOtp({ type: parsed.type, value: parsed.value, code });

  // Expose the code to the client only in local development when no provider is configured
  const devCode = channel === 'console' && process.env.NODE_ENV !== 'production' ? code : undefined;
  return { channel, devCode };
}

// POST /api/auth/register  { name, identifier, password, role }
export const register = asyncHandler(async (req, res) => {
  const { name, identifier, password, role } = req.body;

  if (!name?.trim() || !identifier || !password) {
    throw httpError(400, 'Name, email/phone and password are required');
  }
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (!['customer', 'seller'].includes(role)) throw httpError(400, 'Role must be customer or seller');

  const parsed = parseIdentifier(identifier);
  if (!parsed) throw httpError(400, 'Enter a valid email address or phone number');

  let user = await User.findOne({ [parsed.type]: parsed.value });
  if (user?.isVerified) throw httpError(409, 'An account already exists. Please log in.');

  if (!user) {
    user = await User.create({
      name: name.trim(),
      [parsed.type]: parsed.value,
      passwordHash: await bcrypt.hash(password, 10),
      role,
    });
  }

  const { channel, devCode } = await issueOtp(parsed);
  res.status(201).json({
    message: 'Verification code sent',
    identifier: parsed.value,
    type: parsed.type,
    channel,
    devCode,
  });
});

// POST /api/auth/verify-otp  { identifier, code }
export const verifyOtp = asyncHandler(async (req, res) => {
  const parsed = parseIdentifier(req.body.identifier);
  const code = String(req.body.code || '').trim();
  if (!parsed || !/^\d{6}$/.test(code)) throw httpError(400, 'Enter the 6-digit code');

  const otp = await Otp.findOne({ identifier: parsed.value }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt < new Date()) {
    throw httpError(400, 'Code expired. Please request a new one');
  }
  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    throw httpError(429, 'Too many wrong attempts. Request a new code');
  }
  if (otp.codeHash !== hashOtp(code)) {
    otp.attempts += 1;
    await otp.save();
    throw httpError(400, 'Incorrect code');
  }

  await Otp.deleteMany({ identifier: parsed.value });
  const user = await User.findOneAndUpdate(
    { [parsed.type]: parsed.value },
    { isVerified: true },
    { new: true }
  );
  if (!user) throw httpError(404, 'Account not found');

  res.json({ token: signToken(user), user: user.toSafe() });
});

// POST /api/auth/resend-otp  { identifier }
export const resendOtp = asyncHandler(async (req, res) => {
  const parsed = parseIdentifier(req.body.identifier);
  if (!parsed) throw httpError(400, 'Enter a valid email address or phone number');

  const user = await User.findOne({ [parsed.type]: parsed.value });
  if (!user) throw httpError(404, 'No account found for this email or phone');
  if (user.isVerified) throw httpError(400, 'This account is already verified');

  const result = await issueOtp(parsed);
  res.json({ message: 'New code sent', ...result });
});

// POST /api/auth/login  { identifier, password, role }
export const login = asyncHandler(async (req, res) => {
  const { identifier, password, role } = req.body;
  const parsed = parseIdentifier(identifier);
  if (!parsed || !password) throw httpError(400, 'Email/phone and password are required');

  const user = await User.findOne({ [parsed.type]: parsed.value }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, 'Invalid email/phone or password');
  }

  if (role && role !== user.role) {
    throw httpError(403, `This account is registered as a ${user.role}. Switch the login tab to continue.`);
  }

  if (!user.isVerified) {
    return res.status(403).json({
      message: 'Please verify your account with the OTP sent to you',
      needsVerification: true,
      identifier: parsed.value,
      type: parsed.type,
    });
  }

  res.json({ token: signToken(user), user: user.toSafe() });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafe() });
});
