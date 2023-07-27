const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

require('dotenv').config();

const DeviceSchema = new mongoose.Schema({
    host: {
        type: String,
        trim: true
    },
    port:{
        type: String,
        trim: true
    },
    username:{
        type: String,
        trim: true
    },
    room_ids: [{
        type: Schema.Types.ObjectId,
        ref: 'Rooms'
    }],
    password: {
        type: Date,
        unique: true
    }
});

HouseSchema.pre('save', async function () {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (pass) {
    return await bcryptjs.compare(pass, this.password);
};

module.exports = mongoose.model("Devices", DeviceSchema);