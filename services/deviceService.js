const Device = require('../models/Devices');
const jwt = require('jsonwebtoken');
const log = require("./logService");

function getUserIdFromToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.user_id;
}

async function add(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {
        const device = await Device.create({
            device_name: req.body.device_name,
            host: req.body.host,
            port: req.body.port,
            username: req.body.username,
            password: req.body.password,
            room_id: req.body.room_id
        });

        const devices = await Device.find({ room_id: req.body.room_id }).lean();

        log.logAction(userId, "200", "Device Added Succesfuly", `Device: ${device._id}` );
        res.status(200).json({message:"Device Added Succesfuly", devices}); 
    } catch (error) {
        log.logAction(userId, "500", "Error While Adding A Device" );
        res.status(500).json({ error: 'Error Creating Device' });
    }
}

async function getOne(req, res, next){
    try{
        const device = await Device.find({_id: req.body.id});
        res.status(200).json(device);
    } catch (error){
        res.status(500).json({error: 'Error Getting Single Device'});
    }
}

async function getAll(req, res, next) {
    try {
        const device = await Device.find({ room_id: req.body.room_id }).lean();
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ error: 'Error Getting All Devices' });
    }
}

async function update(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {
        const updateDevice = await Device.findOneAndUpdate(
            { _id: req.body.id, room_id: req.body.room_id },
            req.body,
            { new: true }
        );
        
        log.logAction(userId, "200", "Device Updated Succesfully", `Device: ${req.body.id}` );
        res.status(200).json({message: "Device Updated Succesfuly", updateDevice});
    } catch (error) {
        log.logAction(userId, "500", "Error Updating A Device", `Device: ${req.body.id}`);
        res.status(500).json({ error: 'Error Updating The Device' });
    }
}

async function delet(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {
        await Device.findOneAndDelete({ _id: req.body.id });

        const devices = await Device.find({room_id: req.body.room_id})

        log.logAction(userId, "200", "Device Deleted Succesfuly", `Device: ${req.body.id}` );
        res.status(200).json({message: "Device Removed Succesfuly", devices});
    } catch (error) {
        log.logAction(userId, "500", "Error Deleting A Device", `Device: ${req.body.id}` );
        res.status(500).json({ error: 'Error Deleting A Device' });
    }
}

module.exports = {
  add,
  getOne,
  getAll,
  update,
  delet,
};