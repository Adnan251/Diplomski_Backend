const bcryptjs = require('bcrypt');
const Users = require('../models/Users.js');

async function register (req, res, next){
    try{
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
        res.status(500);
        res.end("Error creating user");
    }
};

async function login (req, res, next){
    const loginInfo = req.body;

    if (!req.body.email || !req.body.password) {
        res.status(401);
        return res.end("Bad request")
    }
    const loginUser = await Users.findOne({
        email: loginInfo.email
    }).select('+password');
    if (!loginUser) {
        res.status(404);
        return res.end("Not found")
    }
    else {
        const passwordMatches = await loginUser.comparePassword(loginInfo.password);
        if (!passwordMatches) {
            console.log("Incorrect password");
            res.status(401);
            return res.end('Incorrect password');
        }
        loginUser.password = undefined;
        delete (loginUser.password);
        const token = loginUser.createJWT();
        res.status(201).send({ loginUser, token });
    }
};

module.exports = {
    register: register,
    login: login,
};