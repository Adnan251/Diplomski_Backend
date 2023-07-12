const db = require("../models");
const User = db.Users;

checkDuplicateEmail = (req, res, next) => {
  User.findOne({ email: req.body.email}).exec((err, user) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }

    if (user) {
      res.status(400).json({ error: "Failed! Email is already in use!" });
      return;
    }
    
    next();
  });
};

const verifySignUp = {
  checkDuplicateEmail
};

module.exports = verifySignUp;