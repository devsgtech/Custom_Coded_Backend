const pool = require('../config/database');

class UserModel {
    static async createUser(userData) {
        const { username, email, password } = userData;
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [username, email, password]);
        return result.insertId;
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.query(query, [email]);
        return rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async updateUser(id, userData) {
        const { username, email } = userData;
        const query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
        const [result] = await pool.query(query, [username, email, id]);
        return result.affectedRows > 0;
    }

    static async deleteUser(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = UserModel; 