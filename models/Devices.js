const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

require('dotenv').config();

const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    device_name:{
        type: String,
        trim: true
    },
    topic:{
        type: String,
        trim: true
    },
    host: {
        type: String,
        trim: true
    },
    port:{
        type: String,
        trim: true
    },
    type:{
        type: String,
        trim: true
    },
    room_id: {
        type: Schema.Types.ObjectId,
        ref: 'Rooms'
    },
    status: {
        type: String,
        trim: true,
    }
});


module.exports = mongoose.model("Devices", DeviceSchema);