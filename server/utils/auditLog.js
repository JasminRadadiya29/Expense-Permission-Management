import AuditLog from '../models/AuditLog.js';

export const logAuditAction = async ({
  company,
  user,
  action,
  resourceType,
  resourceId,
  details = null,
}) => {
  try {
    await AuditLog.create({
      company,
      user,
      action,
      resourceType,
      resourceId,
      details,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

export const getAuditLogs = async (query = {}, limit = 100, skip = 0) => {
  try {
    const logs = await AuditLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await AuditLog.countDocuments(query);
    return { logs, total };
  } catch (error) {
    console.error('Get audit logs error:', error);
    throw error;
  }
};
