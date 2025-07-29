const db = require('../config/database');

const getAllShops = async () => {
  try {
    const [rows] = await db.query(
      'SELECT id, category_id, name, description, amount, `key` FROM tbl_shop'
    );
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error fetching shop details:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getAllShops
}; 