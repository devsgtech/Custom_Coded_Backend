const Joi = require('joi');

const adminLoginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'any.required': 'Email is required',
    'string.email': 'Invalid email format'
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  })
});

module.exports = {
  adminLoginSchema
};
