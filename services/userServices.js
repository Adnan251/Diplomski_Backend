const Users = require('../models/Users.js');
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const qrcode = require('qrcode');
const speakeasy = require('speakeasy');
const addFunct = require('../middleware/additionalFunctions.js');
const log = require("./logService");

function getUserIdFromToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.user_id;
}

async function register (req, res, next){
  try{
    if(req.body.password === req.body.confirmPassword){
        const user = await Users.findOne({ email: req.body.email }).exec();
        if (user) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        if (await addFunct.isPasswordPwned(req.body.password) > 0) {
          return res.status(400).json({ error: 'Password has been Pwned' });
        } else {

          const secret = speakeasy.generateSecret().base32;
          const encripted_secret = cryptoJS.AES.encrypt(secret, process.env.CRYPTO_SECRET).toString();

          let registeredUser = await Users.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            mfa_secret: encripted_secret
          });

          const otpAuthUrl = speakeasy.otpauthURL({
            secret: secret,
            label: req.body.email,
            issuer: 'SmartHive',
          });

          const qrCodeData = await qrcode.toDataURL(otpAuthUrl);

          registeredUser.password = undefined;

          const token = registeredUser.createJWT();

          log.logAction(userId, "200", "User Succesfully Registered", `House: ${registeredUser._id}` );
          res.status(200).json({ token, qrCodeData });
        }  
    }
    else{
        res.status(400).json({ error: 'Passwords are Not the Same' });
    }
  }
  catch(e){
      res.status(500).json({error: "Error creating user"});
  }
};

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email or Password Not Entered" });
    }

    const user = await Users.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ error: "User Not found" });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = user.createJWT();
    const sanitizedUser = {
      _id: user._id,
      username: user.username, 
    };

    log.logAction(user._id, "200", "User Has Loged In", `User: ${user._id}` );
    res.status(200).json({ user: sanitizedUser, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to Log In" });
  }
};

async function checkMFA(req, res, next){
  try{
    let userId = getUserIdFromToken(req);
    const user = await Users.findOne({_id: userId}).select('+mfa_secret');
    const decryptedMfaSecret = cryptoJS.AES.decrypt(user.mfa_secret, process.env.CRYPTO_SECRET).toString(cryptoJS.enc.Utf8);

    const isCodeValid = speakeasy.totp.verify({
        secret: decryptedMfaSecret,
        encoding: 'base32',
        token: res.body.code,
        window: 2, 
      });
      
    console.log(isCodeValid);
    if(isCodeValid){
      res.status(200).json({message: "Success"});
    }
    else{
      res.status(400).json({message:"Failed"});
    }
  }catch(error){
    res.status(500).json({error: "Failed While Verifying MFA"})
  }
};

module.exports = {
  register: register,
  login: login,
  checkMFA: checkMFA   
};