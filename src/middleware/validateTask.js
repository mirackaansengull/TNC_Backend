const AppError = require('../utils/AppError');

const allowedPriorities = ['low', 'medium', 'high'];
const allowedStatuses = ['todo', 'in_progress', 'completed'];

const validateTask = (req, res, next) => {
  const { title, description, priority, assignee } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('title is required and must be a non-empty string');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push('description is required and must be a non-empty string');
  }

  if (priority && !allowedPriorities.includes(priority)) {
    errors.push(`priority must be one of: ${allowedPriorities.join(', ')}`);
  }

  if (assignee && (typeof assignee !== 'string' || assignee.trim() === '')) {
    errors.push('assignee must be a non-empty string when provided');
  }

  if (req.body.status && !allowedStatuses.includes(req.body.status)) {
    errors.push(`status must be one of: ${allowedStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors));
  }

  next();
};

module.exports = validateTask;
