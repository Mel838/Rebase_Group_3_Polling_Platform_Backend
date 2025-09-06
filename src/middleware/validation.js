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
    console.log('🔍 Request body:', req.body);
    console.log('🔍 Request body type:', typeof req.body);
    console.log('🔍 Request content-type:', req.headers['content-type']);
    
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    console.log('🔍 Validation error:', error);
    console.log('🔍 Validation value:', value);
    
    if (error) {
      const errors = error.details.map(el => el.message);
      const message = `Invalid input data: ${errors.join('. ')}`;
      return next(new AppError(message, 400));
    }
    
    // Attach the validated data to the request object
    req.validatedData = value; 
    
    next();
  };
};