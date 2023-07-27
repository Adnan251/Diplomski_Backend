const mongoose = require('mongoose');

require('dotenv').config();

const UserLogsSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    logs: [
        {
            status: {
                type: Number,
                required: true
            },
            message: {
                type: String,
                required: true,
                trim: true
            },
            device: {
                type: String,
                trim: true
            }
        }
    ],
    createdAt: {
        type: Date
    }
});

HouseSchema.pre('save', async function () {
    this.createdAt = new Date().toISOString();
});

module.exports = mongoose.model("UserLogs", UserLogsSchema);