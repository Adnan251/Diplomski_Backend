const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username can\'t be empty'],
        minlength: 5,
        maxlength: 25,
        trim: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: 'Valid email required'
        },
        unique: true // creates an index in the db
    },
    password: {
        type: String,
        required: [true, 'Password can\'t be empty'],
        validate: {
            validator: validator.isStrongPassword,
            message: 'Valid password'
        },
        select: false
    },
    createdAt: {
        type: Date,
        unique: true
    }
});

UserSchema.pre('save', async function () {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    this.createdAt = new Date().toISOString();
});

UserSchema.methods.createJWT = function () {
    return jwt.sign({ 'user_id': this._id, 'username': this.username, 'email':this.email }, process.env.JWT_SECRET);
}

UserSchema.methods.comparePassword = async function (pass) {
    return await bcryptjs.compare(pass, this.password);
}

module.exports = mongoose.model("Users", UserSchema);