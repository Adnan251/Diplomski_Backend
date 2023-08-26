const Device = require('../models/Devices');
const Room = require('../models/Rooms');
const House = require('../models/Houses');
const jwt = require('jsonwebtoken');
const log = require("./logService");
const mqtt = require('mqtt');

function getUserIdFromToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.user_id;
}

async function add(req, res, next) {
    const userId = getUserIdFromToken(req);
    try {
        var house = await House.findById( req.body.house_id);
        var room = await Room.findById( req.body.room_id);

        var house_name = house.house_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        var room_name = room.room_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        var device_name = req.body.device_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        const topic = `${house_name}/${room_name}/${device_name}`;

        const device = await Device.create({
            device_name: req.body.device_name,
            topic: topic,
            host: req.body.host,
            port: req.body.port,
            type: req.body.type,
            status: req.body.status,
            room_id: req.body.room_id
        });

        const devices = await Device.find({ room_id: req.body.room_id }).lean();

        log.logAction(userId, "200", "Device Added Succesfuly", `Device: ${device._id}` );
        res.status(200).json({message:"Device Added Succesfuly", devices}); 
    } catch (error) {
        log.logAction(userId, "500", "Error While Adding A Device" );
        res.status(500).json({ error: 'Error Creating Device' });
    }
};

async function sendMessage(req, res, next) {
    const userId = getUserIdFromToken(req);
    let responseData;
    try {
        const device = await Device.findById(req.body.device_id);
        const client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`);

        client.on('connect', () => {
        
            client.publish(device.topic, req.body.message, (error) => {
                if (error) {
                    console.error('Error publishing to:', error);
                    client.end();
                    return res.status(400).json({ message: 'Error Publishing' });
                }
            });
            if(req.body.message === "read"){
                client.subscribe("backend", (error) => {
                    console.log("success subs")
                    if (error) {
                        client.end();
                        console.log("error")
                        return res.status(500).json({ message: 'Error subscribing' });
                    }
                
                
                    client.on('message', (topic, message) => {
                        responseData = message.toString();
                        console.log(responseData);
                        return res.status(200).json({ message: 'Success',response: responseData });

                    });
                });
            }
            else{
                return res.status(200).json({ message: 'Success'});
            }
    
            log.logAction(userId, "200", `${req.body.message} message sent to Device`, `Device: ${req.body.id}` );
        });
    } catch (err) {
        log.logAction(userId, "500", `Something went wrong while sending a message`, `Device: ${req.body.id}` );
        res.status(500).json({ error: 'Error Sending Message' });
    }
}

async function getOne(req, res, next){
    const userId = getUserIdFromToken(req);
    try{
        const device = await Device.findById(req.body.id);

        const client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`);

        client.on('connect', () => {
            client.publish(device.topic, device.status);

            client.subscribe("backend", (error) => {
                if (error) {
                    client.end();
                    log.logAction(userId, "500", `Could not connect to device`, `Device: ${req.body.id}`);
                    return res.status(500).json({ message: 'Error subscribing' });
                }
            });
        });

        client.on('message', (topic, message) => {
            
            const responseData = message.toString();
            log.logAction(userId, "200", `Successfuly connected a Device`, `Device: ${req.body.id}`);
            return res.json({ message: 'Success', device ,response: responseData });
        });

        client.on('error', (error) => {
            console.error('MQTT error:', error);
            client.end();
            log.logAction(userId, "500", `MQTT error`, `Device: ${req.body.id}`);
            return res.status(500).json({ message: 'MQTT error' });
        });

        log.logAction(userId, "200", `Successfuly connected a Device`, `Device: ${req.body.id}`);
        return res.json({ message: 'Success', device});

    } catch (error){
        log.logAction(userId, "500", `Error Getting Device`, `Device: ${req.body.id}`);
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
  sendMessage,
};