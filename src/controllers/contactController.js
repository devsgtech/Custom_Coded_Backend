const contactService = require('../services/contactService');
const response = require('../utils/response');
const { greetingSchema } = require('../middleware/Validation');

const submitContact = async (req, res) => {
    try {
        
        // Validate request body
        const { error, value } = greetingSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { contact_name, contact_email, contact_greeting,contact_ip,country } = value;

        // Get IP address from request
        // const contact_ip = req.ip || req.connection.remoteAddress;

        // Create contact submission
        const contactId = await contactService.createContact({
            contact_name,
            contact_email,
            contact_greeting,
            contact_ip,
            country
        });

        return response.success(res, null, 'Contact form submitted successfully', 201);
    } catch (error) {
        console.error('Contact submission error:', error);
        return response.error(res, 'Failed to submit contact form', 500);
    }
};

module.exports = {
    submitContact
}; 