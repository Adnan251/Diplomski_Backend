const House = require('../models/Houses');
const jwt = require('jsonwebtoken');

function getUserIdFromToken(req) {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.user_id;
}

async function add(req, res, next) {
    try {
        const userId = getUserIdFromToken(req);
        if(req.body.password === req.body.confirmPassword){
            const createdHouse = await House.create({
                house_name: req.body.house_name,
                address: req.body.address,
                password: req.body.password,
                users_id: userId,
            });

            res.status(201).json(createdHouse);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error Creating House' });
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
    try {
        const userId = getUserIdFromToken(req);
        const houseId = req.body.id;

        const house = await House.findOneAndUpdate(
        { _id: houseId, users_id: userId },
        req.body,
        { new: true }
        );

        if (!house) {
        return res.status(404).json({ error: 'House not found or not owned by the user' });
        }

        res.status(200).json(house);
    } catch (error) {
        res.status(500).json({ error: 'Error Updating The House' });
    }
}

async function delet(req, res, next) {
    try {
        const userId = getUserIdFromToken(req);
        const houseId = req.body.id;

        await House.findOneAndDelete({ _id: houseId, users_id: userId });

        res.status(200).json({message: "House Succesfuly Deleted"});
    } catch (error) {
        res.status(500).json({ error: 'Error Deleting A House' });
    }
}

module.exports = {
  add,
  getAll,
  update,
  delet,
};