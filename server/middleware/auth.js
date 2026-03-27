import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.warn('JWT verification failed:', jwtError.message);
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    const user = await User.findById(decoded.userId).populate('company');

    if (!user) {
      console.warn('User not found for userId:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    // Ensure tokenVersion is properly initialized
    const decodedTokenVersion = typeof decoded.tokenVersion === 'number' ? decoded.tokenVersion : 0;
    const currentTokenVersion = typeof user.tokenVersion === 'number' ? user.tokenVersion : 0;

    // Debug logging (remove in production if too verbose)
    if (decodedTokenVersion !== currentTokenVersion) {
      console.warn(`Token version mismatch for user ${user._id}: decoded=${decodedTokenVersion}, current=${currentTokenVersion}`);
    }

    if (decodedTokenVersion !== currentTokenVersion) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    req.user = user;
    req.userId = user._id;
    req.companyId = user.company?._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

export { auth, authorize };