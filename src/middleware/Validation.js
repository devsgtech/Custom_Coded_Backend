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

const fetchAdminUsersSchema = Joi.object({
    currentPage: Joi.number().required().messages({
        'any.required': 'Page number is required'
    }),
    itemsPerPage: Joi.number().required().messages({
        'any.required': 'Items per page is required'
    }),
    filters: Joi.array().optional(),
    search: Joi.string().optional().allow('')
})

const createAdminUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false }}).required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
    role: Joi.string().required(),
    security_questions: Joi.array().items(
        Joi.object({
            question_id: Joi.number().required(),
            answer: Joi.string().required()
        })
    ).required()
})

const findMetaSchema = Joi.object({
    meta_id: Joi.number().required()
})


const createmetaSchema = Joi.object({
    token: Joi.string().required(),
    meta_data: Joi.object({
        meta_key: Joi.string().required(),
        meta_value: Joi.string().required(),
        meta_group: Joi.string().required()
      }).required()
});

const updateMetaSchema = Joi.object({
    meta_id: Joi.number().required(),
    meta_key: Joi.string().required(),
    meta_value: Joi.string().required(),
})

const deleteMetaSchema = Joi.object({
    meta_id: Joi.number().required(),
    meta_value: Joi.string().required(),
})

const addMetaAssetSchema = Joi.object({
    meta_id: Joi.number().required(),
    meta_key: Joi.string().required(),
})

const fetchCodeIdSchema = Joi.object({
    currentPage: Joi.number().required().messages({
        'any.required': 'Page number is required'
    }),
    itemsPerPage: Joi.number().required().messages({
        'any.required': 'Items per page is required'
    }),
    filters: Joi.array().optional(),
    search: Joi.string().optional().allow('')
});

const deleteCodeIdSchema = Joi.object({
    code_id: Joi.number().required()
})

const createcodeidSchema = Joi.object({
    code_data: Joi.object({
        category_id: Joi.string().required(),
        numberOfCodes: Joi.number().optional().default(1),
      }).required()
});

const createFaqSchema = Joi.object({
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
    faq_id: Joi.number().required(),
    faq_question: Joi.string().required(),
    faq_answer: Joi.string().required()
});

const deleteFaqSchema = Joi.object({
    faq_id: Joi.number().required()
});

const getmetaSchema = Joi.object({
    meta_group: Joi.string().required(),
    ip_address: Joi.string().required()
});

const getMessagesSchema = Joi.object({
    currentPage: Joi.number().required().messages({
        'any.required': 'Page number is required'
    }),
    itemsPerPage: Joi.number().required().messages({
        'any.required': 'Items per page is required'
    }),
    filters: Joi.array().optional(),
    search: Joi.string().optional().allow('')
});

const changeStatusSchema = Joi.object({
    status: Joi.string().required().messages({
        'any.required': 'Status is required'
    }),
    contact_id: Joi.number().required().messages({
        'any.required': 'Contact ID is required'
    })
})

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
    code_id: Joi.number().required().messages({
        'any.required': 'Code ID is required',
        'number.base': 'Code ID must be a number'
    }),
    token: Joi.string().required()
});

module.exports = { 
    greetingSchema,
    faqDataSchema,
    createFaqSchema,
    updateFaqSchema,
    deleteFaqSchema,

    fetchAdminUsersSchema,
    createAdminUserSchema,

    createCategotySchema,

    createmetaSchema,
    getmetaSchema,
    findMetaSchema,
    updateMetaSchema,
    deleteMetaSchema,
    addMetaAssetSchema,

    getMessagesSchema,
    changeStatusSchema,
    
    fetchCodeIdSchema,
    deleteCodeIdSchema,
    createcodeidSchema,
    
    UserLoginSchema,
<<<<<<< Updated upstream
    uploadVideoSchema
=======
    
    uploadVideoSchema,
    checkVideoStatusSchema
>>>>>>> Stashed changes
};