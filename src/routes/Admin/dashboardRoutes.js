const express = require("express");
const router = express.Router();
const dashboardController = require("../../modules/Admin/dashboardController");

router.get('/', dashboardController.index)

module.exports = router;