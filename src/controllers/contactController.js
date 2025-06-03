const contactService = require('../services/contactService');
const response = require('../utils/response');
const { greetingSchema } = require('../middleware/Validation');
const axios = require('axios');
const { CAPTCHA_VERIFY_URL, ERROR_MESSAGES } = require('../config/constants')

const submitContact = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = greetingSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { contact_name, contact_email, contact_greeting, contact_ip, contact_country, contact_captcha_token} = value;

        // Step 1: Verify CAPTCHA before proceeding
        const verifyUrl = CAPTCHA_VERIFY_URL;
        const captchaResponse = await axios.post(verifyUrl, null, {
            params: {
                secret: process.env.CAPTCHA_SECRET_KEY,
                response: contact_captcha_token,
                remoteip: contact_ip // optional
            }
        });
        if (!captchaResponse.data.success) {
            return response.validationError(res, ERROR_MESSAGES.CAPTCHA_VERIFICATON_FAILED);
        }
        const verifiedCaptchaToken = "Verified";

        // Step 2: Create contact record
        const contactId = await contactService.createContact({
            contact_name,
            contact_email,
            contact_greeting,
            contact_ip,
            contact_country,
            contact_captcha_token:verifiedCaptchaToken
        });

        return response.success(res, null, ERROR_MESSAGES.CONTACT_SUCCESS , 201);
    } catch (error) {
        console.error('Contact submission error:', error);
        return response.error(res, ERROR_MESSAGES.CONTACT_FAIL, 500);
    }
};


module.exports = {
    submitContact
}; 