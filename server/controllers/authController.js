import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
};

const generateTemporaryPassword = () => {
  // Cryptographically secure password generation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < 12; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  
  return password;
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
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
      email,
      password,
      role: 'Admin',
      company: company._id,
      currency: baseCurrency
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

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

    const user = await User.findOne({ email }).populate('company').populate('manager', 'name email');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = temporaryPassword;
    user.isTemporaryPassword = true;
    await user.save();

    // Return the temporary password so frontend can send email using EmailJS
    res.json({ 
      message: 'Password reset successful', 
      temporaryPassword: temporaryPassword,
      email: email 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
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

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

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

    const user = await User.findById(userId);
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
    await user.save();

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