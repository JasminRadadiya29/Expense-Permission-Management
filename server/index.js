import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { 
  securityHeaders, 
  apiLimiter, 
  authLimiter, 
  passwordResetLimiter,
  compressionMiddleware 
} from './middleware/security.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import expenseRoutes from './routes/expenses.js';
import approvalRoutes from './routes/approvals.js';
import approvalRuleRoutes from './routes/approvalRules.js';

// Debug: Check if environment variables are loaded
// console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not loaded');
// console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not loaded');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(securityHeaders);
app.use(compressionMiddleware);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/approval-rules', approvalRuleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value',
      field: Object.keys(err.keyValue)[0]
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});