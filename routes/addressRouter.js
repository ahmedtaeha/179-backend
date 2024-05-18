const express = require("express");
const { getByKeyword, getByID } = require("../controllers/address");

const router = express.Router();

router.post("/getByKeyword", getByKeyword);
router.post("/getByID", getByID);

module.exports = router;