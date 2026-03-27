import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { sendPasswordResetLinkEmail } from '../utils/email.js';
import { logAuditAction } from '../utils/auditLog.js';

const generateToken = (user) => {
  // Ensure tokenVersion is always a number (default to 0 if not set)
  const tokenVersion = typeof user.tokenVersion === 'number' ? user.tokenVersion : 0;
  return jwt.sign(
    { userId: user._id, tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

const generateRefreshToken = (user) => {
  // Ensure tokenVersion is always a number (default to 0 if not set)
  const tokenVersion = typeof user.tokenVersion === 'number' ? user.tokenVersion : 0;
  return jwt.sign(
    { userId: user._id, tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const generateTokenPair = (user) => ({
  token: generateToken(user),
  refreshToken: generateRefreshToken(user),
});

const buildResetBaseUrl = () => {
  return (
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  );
};

const createPasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, country } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered',
        field: 'email',
        message: 'An account with this email address already exists. Please use a different email or try logging in.'
      });
    }

    // Fetch country data and validate country
    let baseCurrency = 'USD';
    try {
      const countryResponse = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countries = await countryResponse.json();
      const selectedCountry = countries.find(c => c.name.common === country);
      
      if (!selectedCountry) {
        return res.status(400).json({
          error: 'Invalid country',
          field: 'country',
          message: 'Please provide a valid country name.'
        });
      }
      
      baseCurrency = selectedCountry.currencies ? Object.keys(selectedCountry.currencies)[0] : 'USD';
    } catch (countryError) {
      console.warn('Country API error, using default currency:', countryError.message);
    }

    // Create company
    const company = await Company.create({
      name: `${name}'s Company`,
      country,
      baseCurrency
    });

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'Admin',
      company: company._id,
      currency: baseCurrency
    });

    const { token, refreshToken } = generateTokenPair(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: company,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email already registered',
        field: 'email',
        message: 'An account with this email address already exists.'
      });
    }
    
    res.status(500).json({ 
      error: 'Error creating account',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).populate('company').populate('manager', 'name email');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { token, refreshToken } = generateTokenPair(user);

    // Log successful login
    if (user.company) {
      await logAuditAction({
        company: user.company._id,
        user: user._id,
        action: 'LOGIN',
        resourceType: 'User',
        resourceId: user._id,
        details: { email: normalizedEmail }
      }).catch(err => console.error('Audit log error:', err));
    }

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        manager: user.manager,
        currency: user.currency,
        isTemporaryPassword: user.isTemporaryPassword
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const genericResponse = {
      message: 'If an account exists, a password reset link has been sent.',
    };

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json(genericResponse);
    }

    const { rawToken, tokenHash } = createPasswordResetToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetBaseUrl = buildResetBaseUrl();
    const resetUrl = `${resetBaseUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetLinkEmail({
      toEmail: normalizedEmail,
      resetUrl,
    });

    return res.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Error resetting password' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Reset link is invalid or expired' });
    }

    user.password = newPassword;
    user.isTemporaryPassword = false;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    return res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Error resetting password' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const decodedTokenVersion = typeof decoded.tokenVersion === 'number' ? decoded.tokenVersion : 0;
    const currentTokenVersion = user.tokenVersion ?? 0;
    if (decodedTokenVersion !== currentTokenVersion) {
      return res.status(401).json({ error: 'Refresh token expired. Please login again.' });
    }

    const { token: newToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId).populate('company');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.isTemporaryPassword = false;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    // Log password change
    if (user.company) {
      await logAuditAction({
        company: user.company._id,
        user: user._id,
        action: 'PASSWORD_CHANGE',
        resourceType: 'User',
        resourceId: user._id,
        details: { email: user.email }
      }).catch(err => console.error('Audit log error:', err));
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error changing password' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('company').populate('manager', 'name email');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        manager: user.manager,
        currency: user.currency,
        isTemporaryPassword: user.isTemporaryPassword
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('company');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    // Log logout
    if (user.company) {
      await logAuditAction({
        company: user.company._id,
        user: user._id,
        action: 'LOGOUT',
        resourceType: 'User',
        resourceId: user._id,
        details: { email: user.email }
      }).catch(err => console.error('Audit log error:', err));
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Error logging out' });
  }
};