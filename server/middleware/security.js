import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Auth endpoints rate limit (stricter)
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Password reset rate limit (very strict)
const passwordResetLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  100, // limit each IP to 3 requests per hour
  'Too many password reset attempts, please try again later.'
);

// Compression middleware
const compressionMiddleware = compression();

export {
  securityHeaders,
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  compressionMiddleware,
};