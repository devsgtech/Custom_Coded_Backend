const shopService = require('../services/shopService');

const getAllShops = async (req, res) => {
  try {
    const result = await shopService.getAllShops();
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    return res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error in getAllShops controller:', error);
    return res.status(500).json({ error: 'Failed to fetch shop details.' });
  }
};

module.exports = {
  getAllShops
}; 