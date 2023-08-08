const { add, getOne, getAll, update, delet } = require("../services/houseService");

const router = require("express").Router();

router.post("/add", add);
router.get("/getOne", getOne);
router.get("/getAll", getAll);
router.put("/update", update);
router.delete("/delet", delet);

module.exports = router;