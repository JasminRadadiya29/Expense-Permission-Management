const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mongoIdRegex = /^[a-f\d]{24}$/i;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].{7,}$/;

const toValidationError = (details) => ({
  error: 'Validation failed',
  details,
});

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isEmail = (value) => typeof value === 'string' && emailRegex.test(value.trim());
const isMongoId = (value) => typeof value === 'string' && mongoIdRegex.test(value);

export const validateSignupPayload = (body) => {
  const details = [];

  if (!isNonEmptyString(body?.name)) {
    details.push({ field: 'name', message: 'Name is required' });
  }

  if (!isEmail(body?.email)) {
    details.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!strongPasswordRegex.test(body?.password || '')) {
    details.push({
      field: 'password',
      message: 'Password must be at least 8 chars and include uppercase, lowercase, number, special char',
    });
  }

  if (!isNonEmptyString(body?.confirmPassword) || body.confirmPassword !== body.password) {
    details.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  if (!isNonEmptyString(body?.country)) {
    details.push({ field: 'country', message: 'Country is required' });
  }

  return details.length ? toValidationError(details) : null;
};

export const validateLoginPayload = (body) => {
  const details = [];

  if (!isEmail(body?.email)) {
    details.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!isNonEmptyString(body?.password)) {
    details.push({ field: 'password', message: 'Password is required' });
  }

  return details.length ? toValidationError(details) : null;
};

export const validateRefreshPayload = (body) => {
  if (!isNonEmptyString(body?.refreshToken)) {
    return toValidationError([{ field: 'refreshToken', message: 'Refresh token is required' }]);
  }

  return null;
};

export const validateForgotPasswordPayload = (body) => {
  if (!isEmail(body?.email)) {
    return toValidationError([{ field: 'email', message: 'Please provide a valid email address' }]);
  }

  return null;
};

export const validateChangePasswordPayload = (body) => {
  const details = [];

  if (!isNonEmptyString(body?.currentPassword)) {
    details.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  if (!strongPasswordRegex.test(body?.newPassword || '')) {
    details.push({
      field: 'newPassword',
      message: 'New password must be at least 8 chars and include uppercase, lowercase, number, special char',
    });
  }

  if (body?.newPassword && body?.currentPassword && body.newPassword === body.currentPassword) {
    details.push({ field: 'newPassword', message: 'New password must be different from current password' });
  }

  return details.length ? toValidationError(details) : null;
};

export const validateCreateExpensePayload = (body) => {
  const details = [];
  const categories = ['Travel', 'Food', 'Office Supplies', 'Software', 'Hardware', 'Marketing', 'Other'];
  const paidByOptions = ['Company', 'Personal'];

  if (!isNonEmptyString(body?.description) || body.description.trim().length < 5) {
    details.push({ field: 'description', message: 'Description must be at least 5 characters' });
  }

  if (!categories.includes(body?.category)) {
    details.push({ field: 'category', message: 'Invalid expense category' });
  }

  if (!isNonEmptyString(body?.date) || Number.isNaN(Date.parse(body.date))) {
    details.push({ field: 'date', message: 'Date must be a valid ISO date' });
  }

  if (typeof body?.amount !== 'number' || body.amount <= 0) {
    details.push({ field: 'amount', message: 'Amount must be a positive number' });
  }

  if (!isNonEmptyString(body?.currency) || body.currency.length !== 3) {
    details.push({ field: 'currency', message: 'Currency must be a 3-letter code' });
  }

  if (body?.amountInBaseCurrency !== undefined && (typeof body.amountInBaseCurrency !== 'number' || body.amountInBaseCurrency <= 0)) {
    details.push({ field: 'amountInBaseCurrency', message: 'Amount in base currency must be a positive number when provided' });
  }

  if (!paidByOptions.includes(body?.paidBy)) {
    details.push({ field: 'paidBy', message: 'Paid by must be either Company or Personal' });
  }

  return details.length ? toValidationError(details) : null;
};

export const validateUpdateExpensePayload = (body) => {
  const details = [];
  const categories = ['Travel', 'Food', 'Office Supplies', 'Software', 'Hardware', 'Marketing', 'Other'];
  const paidByOptions = ['Company', 'Personal'];

  if (body?.description !== undefined && (!isNonEmptyString(body.description) || body.description.trim().length < 5)) {
    details.push({ field: 'description', message: 'Description must be at least 5 characters' });
  }

  if (body?.category !== undefined && !categories.includes(body.category)) {
    details.push({ field: 'category', message: 'Invalid expense category' });
  }

  if (body?.date !== undefined && (!isNonEmptyString(body.date) || Number.isNaN(Date.parse(body.date)))) {
    details.push({ field: 'date', message: 'Date must be a valid ISO date' });
  }

  if (body?.amount !== undefined && (typeof body.amount !== 'number' || body.amount <= 0)) {
    details.push({ field: 'amount', message: 'Amount must be a positive number' });
  }

  if (body?.currency !== undefined && (!isNonEmptyString(body.currency) || body.currency.length !== 3)) {
    details.push({ field: 'currency', message: 'Currency must be a 3-letter code' });
  }

  if (body?.amountInBaseCurrency !== undefined && (typeof body.amountInBaseCurrency !== 'number' || body.amountInBaseCurrency <= 0)) {
    details.push({ field: 'amountInBaseCurrency', message: 'Amount in base currency must be a positive number' });
  }

  if (body?.paidBy !== undefined && !paidByOptions.includes(body.paidBy)) {
    details.push({ field: 'paidBy', message: 'Paid by must be either Company or Personal' });
  }

  return details.length ? toValidationError(details) : null;
};

export const validateCreateUserPayload = (body) => {
  const details = [];

  if (!isNonEmptyString(body?.name) || body.name.trim().length < 2) {
    details.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (!isEmail(body?.email)) {
    details.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!['Employee', 'Manager'].includes(body?.role)) {
    details.push({ field: 'role', message: 'Role must be Employee or Manager' });
  }

  if (body?.managerId !== undefined && body.managerId !== null && body.managerId !== '' && !isMongoId(body.managerId)) {
    details.push({ field: 'managerId', message: 'Manager ID must be a valid MongoDB ObjectId' });
  }

  return details.length ? toValidationError(details) : null;
};

export const validateUpdateUserPayload = (body) => {
  const details = [];

  if (body?.name !== undefined && (!isNonEmptyString(body.name) || body.name.trim().length < 2)) {
    details.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (body?.role !== undefined && !['Employee', 'Manager', 'Admin'].includes(body.role)) {
    details.push({ field: 'role', message: 'Role must be Employee, Manager, or Admin' });
  }

  if (body?.managerId !== undefined && body.managerId !== null && body.managerId !== '' && !isMongoId(body.managerId)) {
    details.push({ field: 'managerId', message: 'Manager ID must be a valid MongoDB ObjectId' });
  }

  return details.length ? toValidationError(details) : null;
};

const validateApprovalSteps = (steps) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return 'Steps must be a non-empty array';
  }

  for (const step of steps) {
    if (typeof step?.stepNumber !== 'number' || step.stepNumber < 1) {
      return 'Each step must have a valid stepNumber';
    }

    if (!Array.isArray(step?.approvers)) {
      return 'Each step must have an approvers array';
    }

    if (step.approvers.some((approverId) => !isMongoId(String(approverId)))) {
      return 'Each approver must be a valid MongoDB ObjectId';
    }
  }

  return null;
};

export const validateApprovalRulePayload = (body) => {
  const details = [];

  if (!isNonEmptyString(body?.name)) {
    details.push({ field: 'name', message: 'Rule name is required' });
  }

  const stepsError = validateApprovalSteps(body?.steps);
  if (stepsError) {
    details.push({ field: 'steps', message: stepsError });
  }

  return details.length ? toValidationError(details) : null;
};

export const validateProcessApprovalPayload = (body) => {
  const details = [];

  if (!['Approved', 'Rejected'].includes(body?.status)) {
    details.push({ field: 'status', message: 'Status must be Approved or Rejected' });
  }

  if (body?.comments !== undefined && typeof body.comments !== 'string') {
    details.push({ field: 'comments', message: 'Comments must be a string' });
  }

  return details.length ? toValidationError(details) : null;
};
