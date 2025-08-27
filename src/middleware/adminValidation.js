const Joi = require('joi');

const adminLoginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'any.required': 'Email is required',
    'string.email': 'Invalid email format'
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  recaptcha_token: Joi.string().required().messages({
    'any.required': 'Recaptcha token is required'
  })
});

const securityQuestionsSchema = Joi.object({
    token: Joi.string().required()
});

const verifySecurityAnswerSchema = Joi.object({
    questions: Joi.array().items(Joi.object({
        question_id: Joi.number().required(),
        answer: Joi.string().required().allow('')
    })).min(1).required()
});


module.exports = {
  adminLoginSchema,
  securityQuestionsSchema,
  verifySecurityAnswerSchema
};
