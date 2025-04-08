const Joi = require('joi');

const greetingSchema = Joi.object({
    contact_name: Joi.string().required(),
    contact_email: Joi.string().email({ tlds: { allow: false } }).required(),
    contact_greeting: Joi.string().required(),
    contact_ip: Joi.string().allow(''),
    country: Joi.string().allow('')
});

const faqDataSchema = Joi.object({
    faq_question: Joi.string().required(),
    faq_answer: Joi.string().required(),
    admin_id: Joi.number().required()
});

const createFaqSchema = Joi.object({
    token: Joi.string().required(),
    faq_data: faqDataSchema
});

const updateFaqSchema = Joi.object({
    token: Joi.string().required(),
    faq_id: Joi.number().required(),
    faq_question: Joi.string().required(),
    faq_answer: Joi.string().required()
});

const deleteFaqSchema = Joi.object({
    token: Joi.string().required(),
    faq_id: Joi.number().required()
});

module.exports = { 
    greetingSchema,
    faqDataSchema,
    createFaqSchema,
    updateFaqSchema,
    deleteFaqSchema
};