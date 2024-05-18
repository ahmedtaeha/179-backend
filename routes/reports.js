const express = require("express");
const { getListOfStatitcs } = require("../controllers/reports");

const router = express.Router();

router.get("/get-stats/:userId",getListOfStatitcs);

module.exports = router;
