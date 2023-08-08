const mongoose = require('mongoose');

require('dotenv').config();

const Schema = mongoose.Schema;

const LogsSchema = new Schema({
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
            additional: {
                type: String,
                default: null,
                trim: true
            },
            time:{
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date
    }
});

LogsSchema.pre('save', async function () {
    this.createdAt = new Date().toISOString();
});

module.exports = mongoose.model("Logs", LogsSchema);