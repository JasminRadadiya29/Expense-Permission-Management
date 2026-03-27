import User from '../models/User.js';
import crypto from 'crypto';

const generateTemporaryPassword = () => {
  return crypto.randomBytes(16).toString('hex');
};

const isEligibleManagerRole = (role) => role === 'Manager' || role === 'Admin';

const validateManagerAssignment = async ({ companyId, userId, managerId }) => {
  if (!managerId) {
    return null;
  }

  if (userId && userId.toString() === managerId.toString()) {
    return 'User cannot be their own manager';
  }

  const managerUser = await User.findOne({ _id: managerId, company: companyId }).select('_id role manager');
  if (!managerUser) {
    return 'Assigned manager not found in company';
  }

  if (!isEligibleManagerRole(managerUser.role)) {
    return 'Assigned manager must have Manager or Admin role';
  }

  if (userId) {
    let cursor = managerUser;
    const visited = new Set();

    while (cursor?.manager) {
      const managerKey = cursor.manager.toString();
      if (visited.has(managerKey)) break;
      visited.add(managerKey);

      if (managerKey === userId.toString()) {
        return 'Manager assignment creates a reporting cycle';
      }

      cursor = await User.findOne({ _id: cursor.manager, company: companyId }).select('_id manager');
      if (!cursor) break;
    }
  }

  return null;
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ company: req.companyId, isActive: true })
      .populate('manager', 'name email')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, role, managerId, currency } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const managerValidationError = await validateManagerAssignment({
      companyId: req.companyId,
      managerId,
    });

    if (managerValidationError) {
      return res.status(400).json({ error: managerValidationError });
    }

    const temporaryPassword = generateTemporaryPassword();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: temporaryPassword,
      isTemporaryPassword: true,
      role,
      company: req.companyId,
      manager: managerId || null,
      currency: currency || req.user.company.baseCurrency
    });

    const populatedUser = await User.findById(user._id)
      .populate('manager', 'name email')
      .select('-password');

    // Return user data along with temporary password for frontend to send email
    res.status(201).json({ 
      user: populatedUser,
      temporaryPassword: temporaryPassword,
      email: normalizedEmail,
      userName: name
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, role, managerId, currency } = req.body;

    const user = await User.findOne({ _id: userId, company: req.companyId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (managerId !== undefined) {
      const managerValidationError = await validateManagerAssignment({
        companyId: req.companyId,
        userId,
        managerId,
      });

      if (managerValidationError) {
        return res.status(400).json({ error: managerValidationError });
      }
    }

    if (role && !isEligibleManagerRole(role)) {
      const directReportsCount = await User.countDocuments({ company: req.companyId, manager: userId });
      if (directReportsCount > 0) {
        return res.status(400).json({ error: 'Cannot demote user with active direct reports. Reassign reports first.' });
      }
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (managerId !== undefined) user.manager = managerId || null;
    if (currency) user.currency = currency;

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('manager', 'name email')
      .select('-password');

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId, company: req.companyId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = temporaryPassword;
    user.isTemporaryPassword = true;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    // Return the temporary password so frontend can send email using EmailJS
    res.json({ 
      message: 'Password reset successful', 
      temporaryPassword: temporaryPassword,
      email: user.email,
      userName: user.name
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
};

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({
      company: req.companyId,
      role: { $in: ['Manager', 'Admin'] },
      isActive: true
    }).select('_id name email role');

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Error fetching managers' });
  }
};