const contactService = require('../services/contactService');
const response = require('../utils/response');

const submitContact = async (req, res) => {
    try {
        const { contact_name, contact_email, contact_greeting } = req.body;
        
        // Validate required fields
        if (!contact_name || !contact_email || !contact_greeting) {
            return response.error(res, 'All fields are required', 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact_email)) {
            return response.error(res, 'Invalid email format', 400);
        }

        // Get IP address from request
        const contact_ip = req.ip || req.connection.remoteAddress;

        // Create contact submission
        const contactId = await contactService.createContact({
            contact_name,
            contact_email,
            contact_greeting,
            contact_ip
        });

        return response.success(res, {
            id: contactId,
            contact_name,
            contact_email,
            contact_greeting
        }, 'Contact form submitted successfully', 201);
    } catch (error) {
        console.error('Contact submission error:', error);
        return response.error(res, 'Failed to submit contact form', 500);
    }
};

module.exports = {
    submitContact
}; 