const express = require("express");
const { getData, getHourlyAverages } = require("../controllers/sensorController");

const router = express.Router();

router.get("/data", getData);
router.get("/data/average/:day", getHourlyAverages);

module.exports = router;
