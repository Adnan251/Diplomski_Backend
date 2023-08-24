const Room = require('../models/Rooms');
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
        await Room.create({
            room_name: req.body.room_name,
            floor: req.body.floor,
            room_type: req.body.room_type,
            house_id: req.body.house_id
        });

        const rooms = await Room.find({ house_id: req.body.house_id }).lean();

        log.logAction(userId, "200", "New Room Added");
        res.status(200).json({message:"New Room Added", rooms});
    } catch (error) {
        log.logAction(userId, "500", "Error Creating A New Room");
        res.status(500).json({ error: 'Error Creating Room' });
    }
}

async function getOne(req, res, next){
    try{
        const room = await Room.find({_id: req.body.id});
        res.status(200).json(room);
    } catch (error){
        res.status(500).json({error: 'Error Getting Single Room'});
    }
}

async function getAll(req, res, next) {
    try {
        const rooms = await Room.find({ house_id: req.body.house_id }).lean();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Error Getting All Rooms' });
    }
}

async function update(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {
        const updateRoom = await Room.findOneAndUpdate(
            { _id: req.body.id, house_id: req.body.house_id },
            req.body,
            { new: true }
        );

        var allRooms = await Room.find({house_id:req.body.house_id})

        log.logAction(userId, "200", "Room Updated", `Room: ${req.body.id}`);
        res.status(200).json({message:"Room Updated succesfuly", allRooms});
    } catch (error) {
        log.logAction(userId, "500", "Error Trying to Update A Room", `Room: ${req.body.id}`);
        res.status(500).json({ error: 'Error Updating The Room' });
    }
}

async function delet(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {

        const devices = await Device.find({room_id: req.body.id});
        if(devices.length > 0){
            await Device.deleteMany()
        }
        await Room.findOneAndDelete({ _id: req.body.id });

        const rooms = await Room.find({house_id:req.body.id})

        log.logAction(userId, "200", "Room Deleted Succesfuly", `Room: ${req.body.id}`);
        res.status(200).json({message: "Room Deleted Succesfuly", rooms});
    } catch (error) {
        log.logAction(userId, "500", "Error Trying to Delete A Room", `Room: ${req.body.id}`);
        res.status(500).json({ error: 'Error Deleting A Room' });
    }
}

module.exports = {
  add,
  getOne,
  getAll,
  update,
  delet,
};