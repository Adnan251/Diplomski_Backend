const { register } = require("../services/userServices");
const { login } = require("../services/userServices");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;