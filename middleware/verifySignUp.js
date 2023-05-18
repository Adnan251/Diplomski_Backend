const db = require("../models");
const User = db.Users;

checkDuplicateEmail = (req, res, next) => {
  User.findOne({
    email: req.body.email//username
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Failed! Email is already in use!" });
      return;
    }
  });
};

const verifySignUp = {
  checkDuplicateEmail
};

module.exports = verifySignUp;