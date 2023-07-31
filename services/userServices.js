const Users = require('../models/Users.js');
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const addFunct = require('../middleware/additionalFunctions.js');

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
          let registeredUser = await Users.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
          });

          registeredUser.password = undefined;

          const token = registeredUser.createJWT();

          res.status(201).json({ token });
        }  
    }
    else{
        res.status(400).json({ error: 'Passwords are Not the Same' });
    }
  }
  catch(e){
      console.log(e);
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

    const token = generateJWT(user._id);
    const sanitizedUser = {
      _id: user._id,
      username: user.username, 
    };

    res.status(200).json({ user: sanitizedUser, token });
  } catch (error) {

    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
    register: register,
    login: login,    
};