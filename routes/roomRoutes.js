const { add, getOne, getAll, update, delet } = require("../services/roomService");

const router = require("express").Router();

router.post("/add", add);
router.get("/getOne", getOne);
router.post("/getAll", getAll);
router.put("/update", update);
router.delete("/delet", delet);

module.exports = router;