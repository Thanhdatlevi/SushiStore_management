
const express = require('express');
const router = express.Router();
const reserveController = require('../../modules/Employee/reserve/reserveController');
router.get('/getMaxMP', reserveController.getMaxMP);
router.get('/dish', reserveController.renderReserveDish);
router.get('/static', reserveController.renderStatic);
router.post('/dishSubmit', reserveController.submitReserveDish);

router.get('/statisticsByBranch', reserveController.statisticsByBranch);
module.exports = router;