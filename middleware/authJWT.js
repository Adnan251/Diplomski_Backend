const jwt = require("jsonwebtoken");
require('dotenv').config();

function verifyUserToken(req, res, next) {
    const users = '/api/users';
    if (req.path === '/' || req.path === users + '/login' || req.path === users + '/register') return next();
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "Missing authorization" });
    }
    const token = authHeader && authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
        req.err = "Error: Invalid JWT token";
        return res.status(401).json({ error: "Access Denied" });
    }
    req.user_id = user.user_id;
    next();
  });
};

const authJwt = {
  verifyUserToken
};
module.exports = authJwt;