const mongoose = require('mongoose');

require('dotenv').config();

const RoomSchema = new mongoose.Schema({
    room_name: {
        type: String,
        required: [true, 'Username can\'t be empty'],
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

HouseSchema.pre('save', async function () {
    this.createdAt = new Date().toISOString();
});

module.exports = mongoose.model("Rooms", RoomSchema);