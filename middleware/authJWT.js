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
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user_id = decoded.user_id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authJwt = {
  verifyUserToken
};
module.exports = authJwt;