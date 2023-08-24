const Log = require('../models/Logs');
const jwt = require('jsonwebtoken');

function getUserIdFromToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.user_id;
}

async function logAction(user_id, status, message, device) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    try {
        const existingLog = await Log.findOne({
            user_id: user_id,
            createdAt: { $gte: today }
        });

        if (existingLog) {
            existingLog.logs.push({
                status: status,
                message: message,
                additional: device,
                time: new Date()
            });
            await existingLog.save();
        } else {
            const newLog = new Log({
                user_id: user_id,
                logs: [{
                    status: status,
                    message: message,
                    additional: device,
                    time: new Date()
                }]
            });
            await newLog.save();
        }
    } catch (error) {
        console.error('Error saving log');
    }
};

function parseDate(dateString) {
    const parts = dateString.split('.');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
};

async function getAll(req, res, next) {
    try {
        const userId = getUserIdFromToken(req);

        const parsedDate = parseDate(req.body.date);
        if (!parsedDate) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const logs = await Log.findOne({
            user_id: userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        res.status(200).json(logs);

    } catch (error) {
        res.status(500).json({ error: 'Error Getting Logs' });
    }
};

module.exports = {
  logAction,
  getAll,
};