const mongoose = require('mongoose');

require('dotenv').config();

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    room_name: {
        type: String,
        required: [true, 'Username can\'t be empty'],
        trim: true
    },
    room_type:{
        type: String,
        trim: true
    },
    floor:{
        type: String,
        trim: true
    },
    house_id:{
        type: Schema.Types.ObjectId,
        ref: 'Houses'
    },
    createdAt: {
        type: Date
    }
});

RoomSchema.pre('save', async function () {
    this.createdAt = new Date().toISOString();
});

module.exports = mongoose.model("Rooms", RoomSchema);