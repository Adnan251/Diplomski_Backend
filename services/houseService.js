const House = require('../models/Houses');
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
        if(req.body.password === req.body.confirmPassword){
            await House.create({
                house_name: req.body.house_name,
                address: req.body.address,
                password: req.body.password,
                users_id: userId
            });

            const allHouses = await House.find({ users_id: userId }).lean();

            log.logAction(userId, "200", "New House Added");
            res.status(200).json({message:"House Added", allHouses});
        }else{
            log.logAction(userId, "400", "Passwords Dont Match When Creating A New House");
            res.status(400).json({error: "Passwords Dont Match"});
        }
    } catch (error) {
        log.logAction(userId, "500", "Error Creating A House");
        res.status(500).json({ error: 'Error Creating A House' });
    }
}

async function getOne(req, res, next){
    try{
        const house = await House.find({_id: req.body.id});
        res.status(200).json(house);
    } catch (error){
        res.status(500).json({error: 'Error Getting Single Hosue'});
    }
}

async function getAll(req, res, next) {
    try {
        const userId = getUserIdFromToken(req);
        const houses = await House.find({ users_id: userId }).lean();
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ error: 'Error Getting All Houses' });
    }
}

async function update(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {

        let house = await House.findOne({_id: req.body.id}).select('+password');
        if (house.comparePassword(req.body.password)){
            delete req.body.password;
            house = await House.findOneAndUpdate(
            { _id: req.body.id, users_id: userId },
            req.body,
            { new: true }
            );

            log.logAction(userId, "200", "House Has Been Updated", `House: ${req.body.id}` );
            res.status(200).json({message: "House Updated Succefuly",house});
        }
        else{
            log.logAction(userId, "400", "Incorrect Password When Updating The Hosue", `House: ${req.body.id}` );
            res.status(400).json({error:"Incorrect Password"});
        }
    } catch (error) {
        log.logAction(userId, "500", "Error While Updating The House", `House: ${req.body.id}`);
        res.status(500).json({ error: 'Error Updating The House' });
    }
}

async function delet(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {
        let house = await House.findOne({_id: req.body.id}).select('+password');
        if (house.comparePassword(req.body.password)){
            const roomsToDelete = await Room.find({ house_id: req.body.id });
            if (roomsToDelete.length > 0) {
                await Room.deleteMany({ house_id: req.body.id });

                const roomIdsToDelete = roomsToDelete.map((room) => room._id);
                const devicesToDelete = await Device.find({ room_id: { $in: roomIdsToDelete } });

                if (devicesToDelete.length > 0) {
                    await Device.deleteMany({ room_id: { $in: roomIdsToDelete } });
                }
            }

            await House.findOneAndDelete({ _id: req.body.id});
            const houses = await House.find({ users_id: userId }).lean();

            log.logAction(userId, "200", "House Has Been Deleted", `House: ${req.body.id}` );
            res.status(200).json({message: "Hosue Deleted Succesfuly", houses});
        }
    } catch (error) {
        log.logAction(userId, "500", "Error While Deleting A House", `House: ${req.body.id}` );
        res.status(500).json({ error: 'Error Deleting A House' });
    }
}

module.exports = {
  add,
  getOne,
  getAll,
  update,
  delet,
};