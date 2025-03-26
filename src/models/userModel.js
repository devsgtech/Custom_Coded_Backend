const db = require("../config/db");

const User = {
  getAllUsers: (callback) => {
    db.query("SELECT * FROM users", callback);
  },

  createUser: (userData, callback) => {
    db.query("INSERT INTO users SET ?", userData, callback);
  },
};

module.exports = User;
