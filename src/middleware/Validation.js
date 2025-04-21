const Joi = require('joi');

const greetingSchema = Joi.object({
    contact_name: Joi.string().required(),
    contact_email: Joi.string().email({ tlds: { allow: false } }).required(),
    contact_greeting: Joi.string().required(),
    contact_captcha_token: Joi.string().required(),
    contact_ip: Joi.string().required().allow(''),
    contact_country: Joi.string().required().allow('')
});

const faqDataSchema = Joi.object({
    faq_question: Joi.string().required(),
    faq_answer: Joi.string().required(),
    admin_id: Joi.number().required()
});

const createmetaSchema = Joi.object({
    token: Joi.string().required(),
    meta_data: Joi.object({
        meta_key: Joi.string().required(),
        meta_value: Joi.string().required(),
        meta_group: Joi.string().required()
      }).required()
});

const createFaqSchema = Joi.object({
    token: Joi.string().required(),
    faq_data: faqDataSchema
});

const createCategotySchema = Joi.object({
    token: Joi.string().required(),
    category_data: Joi.object({
        category_name: Joi.string().required(),
        total_count: Joi.number().required(),
        available_count: Joi.number().required(),
        category_amount: Joi.number().required(),
      }).required()
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

const getmetaSchema = Joi.object({
    meta_group: Joi.string().required()
});

module.exports = { 
    greetingSchema,
    faqDataSchema,
    createFaqSchema,
    updateFaqSchema,
    deleteFaqSchema,
    createCategotySchema,
    createmetaSchema,
    getmetaSchema
};