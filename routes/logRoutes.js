const { add, getAll} = require("../services/logService");

const router = require("express").Router();

router.post("/getAll", getAll);

module.exports = router;