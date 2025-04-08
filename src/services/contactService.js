const pool = require('../config/database');

const contactService = {
    // Create contact submission
    createContact: async (contactData) => {
        try {
            const { contact_name, contact_email, contact_greeting, contact_ip, country } = contactData;
            
            const query = `
                INSERT INTO tbl_contact_us 
                (contact_name, contact_email, contact_greeting, created_on, contact_ip, country) 
                VALUES (?, ?, ?, NOW(), ?, ?)
            `;
            
            const [result] = await pool.execute(query, [
                contact_name,
                contact_email,
                contact_greeting,
                contact_ip,
                country
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error('Error creating contact submission:', error);
            throw new Error('Failed to submit contact form');
        }
    }
};

module.exports = contactService; 