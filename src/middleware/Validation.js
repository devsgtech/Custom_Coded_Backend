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
        meta_group: Joi.string().required(),
        meta_remarks: Joi.string(), // Optional field for remarks
      }).required()
});

const createcodeidSchema = Joi.object({
    token: Joi.string().required(),
    code_data: Joi.object({
        category_id: Joi.string().required()
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
    meta_group: Joi.string().required(),
    ip_address: Joi.string().required()
});

const UserLoginSchema = Joi.object({
    generated_code_id: Joi.string().length(10).required().messages({
        'any.required': 'Code ID is required',
        'string.length': 'Code must be exactly 10 characters long'
    }),
    generated_code: Joi.string().length(10).required().messages({
        'any.required': 'Code is required',
        'string.length': 'Code must be exactly 10 characters long'
    }),
    session_timezone: Joi.string().required(),
    session_ip: Joi.string().required(),
    session_country: Joi.string().required()
});

const uploadVideoSchema = Joi.object({
    code_id: Joi.string().required().messages({
        'any.required': 'Code ID is required'
    }),
    token: Joi.string().required(),
    upload_path_id: Joi.string().required().messages({
        'any.required': 'Upload ID is required'
    }),
    text: Joi.string().required().messages({
        'any.required': 'Text is required'
    }),
    background_asset_id: Joi.string().required().messages({
        'any.required': 'Background id is required'
    }),
    overlay_asset_id: Joi.string().required().messages({
        'any.required': 'Overlay id is required'
    }),
    font_color_asset_id:Joi.string().required().messages({
        'any.required': 'Font color id is required'
    }),
    font_type_asset_id:Joi.string().required().messages({
        'any.required': 'Font type id is required'
    }),
    text_alignment:Joi.string().required().messages({
        'any.required': 'Text Alignment is required'
    }),
});

const checkVideoStatusSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Token is required'
    }),
    code_id: Joi.string().required().messages({
        'any.required': 'Code ID is required'
    })
});

module.exports = { 
    greetingSchema,
    faqDataSchema,
    createFaqSchema,
    updateFaqSchema,
    deleteFaqSchema,
    createCategotySchema,
    createmetaSchema,
    getmetaSchema,
    createcodeidSchema,
    UserLoginSchema,
    uploadVideoSchema,
    checkVideoStatusSchema
};