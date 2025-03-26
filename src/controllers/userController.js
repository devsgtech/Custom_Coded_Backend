const User = require("../models/userModel");

exports.getUsers = (req, res) => {
  User.getAllUsers((err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
};

exports.createUser = (req, res) => {
  const newUser = req.body;
  User.createUser(newUser, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: results.insertId, ...newUser });
    }
  });
};
