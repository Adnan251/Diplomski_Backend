const { add, getOne, getAll, update, delet, sendMessage} = require("../services/deviceService");

const router = require("express").Router();

router.post("/sendMessage", sendMessage);
router.post("/add", add);
router.get("/getOne", getOne);
router.get("/getAll", getAll);
router.put("/update", update);
router.delete("/delet", delet);

module.exports = router;