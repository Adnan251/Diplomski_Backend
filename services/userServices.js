const Users = require('../models/Users.js');
const em = require("../middleware/verifySignUp.js");
const cryptoJS = require("crypto-js");
const qrcode = require('qrcode');
const jwt = require("jsonwebtoken");
const speakeasy = require('speakeasy');

async function register (req, res, next){
    try{
        await em.checkDuplicateEmail(req, res, next);

        let registeredUser = await Users.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        registeredUser.password = undefined;
        delete (registeredUser.password);

        const token = registeredUser.createJWT();

        res.status(201).send(token)
    }
    catch(e){
        console.log(e);
        res.status(500).json({error: "Error creating user"});
    }
};

async function login (req, res, next){
    const loginInfo = req.body;

    if (!req.body.email || !req.body.password) {
        res.status(401).json({error:"Email or Password Not Entered"});
    }
    const loginUser = await Users.findOne({
        email: loginInfo.email
    }).select('+password');
    if (!loginUser) {
        res.status(404).json({error: "User Not found"});
    }
    else {
        const passwordMatches = await loginUser.comparePassword(loginInfo.password);
        if (!passwordMatches) {
            res.status(401);
            return res.json({error: 'Incorrect password'});
        }
        loginUser.password = undefined;
        delete (loginUser.password);
        const token = loginUser.createJWT();
        res.status(201).send({ loginUser, token });
    }
};

async function setupMFA (req, res, next){
    try{
        var token_data;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer')) {
            token_data = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        } else {
            throw new Error('Invalid or Missing Authorization token');
        }

        const user = await Users.findOne({ id: token_data._id }).select('+mfa_key');

        var key = cryptoJS.AES.decrypt(user.mfa_key, process.env.CRYPTO_SECRET).toString(cryptoJS.enc.Utf8);

        const qr_code = speakeasy.otpauthURL({
            secret: key,
            label: 'Users QR Code',
            algorithm: 'SHA1',
            digits: 6,
            period: 30
        });

        const qrCodeDataURL = await qrcode.toDataURL(qr_code);

        res.status(201).send(qrCodeDataURL );
    }
    catch(e){
        console.log(e);
        res.status(500).json({ error:"Error creating MFA"});
    }
};

async function checkMFA (req, res, next){  
    try{
        var token_data;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer')) {
            token_data = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        } else {
            throw new Error('Invalid or Missing Authorization token');
        }

        const user = await Users.findOne({ id: token_data._id }).select('+mfa_key');

        var key = cryptoJS.AES.decrypt(user.mfa_key, process.env.CRYPTO_SECRET).toString(cryptoJS.enc.Utf8);

        var code = req.body.code;
        code = code.replace(/\s/g, '');

        const verify = await speakeasy.totp.verify({
            secret: key,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if(verify){
            res.status(201).send('Success');
        }else{
            res.status(404).json({ error: 'Wrong Code' });
        }
    }
    catch(e){
        console.log(e);
        res.status(500).json({ error: "Error verifying MFA" });
    }
};

module.exports = {
    register: register,
    login: login,    
    setupMFA: setupMFA,
    checkMFA: checkMFA,
};