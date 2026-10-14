import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verifies the JWT and attaches the user to req.user
export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, please log in' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'Account no longer exists' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your account first' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

// Restricts a route to a given role ("customer" or "seller")
export function restrictTo(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: `Only ${role}s can perform this action` });
    }
    next();
  };
}
