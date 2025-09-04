import Joi from 'joi';
import { AppError } from './errorHandler.js';

// Host registration validation schema
export const registerSchema = Joi.object({
  hostname: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters'
    }),
  
  host_email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long'
    })
});

// Host login validation schema
export const loginSchema = Joi.object({
  host_email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .required()
});

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(el => el.message);
      const message = `Invalid input data: ${errors.join('. ')}`;
      return next(new AppError(message, 400));
    }
    
    next();
  };
};