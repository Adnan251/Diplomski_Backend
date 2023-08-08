const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const cryptoJS = require("crypto-js");

require('dotenv').config();

const Schema = mongoose.Schema;

const HouseSchema = new Schema({
    house_name: {
        type: String,
        required: [true, 'Username can\'t be empty'],
        minlength: 5,
        maxlength: 25,
        trim: true
    },
    address:{
        type: String,
        trim: true
    },
    password:{
        type: String,
        required: [true, 'Password can\'t be empty'],
        select: false

    },
    users_id:{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    createdAt: {
        type: Date
    }
});

HouseSchema.pre('save', async function () {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    this.createdAt = new Date().toISOString();
});

HouseSchema.methods.comparePassword = async function (pass) {
    return await bcryptjs.compare(pass, this.password);
};

module.exports = mongoose.model("Houses", HouseSchema);