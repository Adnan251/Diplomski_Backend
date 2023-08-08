const { add, getAll} = require("../services/logService");

const router = require("express").Router();

router.get("/getAll", getAll);

module.exports = router;