
const express = require('express');
const router = express.Router();
const reserveController = require('../../modules/Customer/reserve/reserveController');
router.get('/getMaxMP', reserveController.getMaxMP);
router.get('/dish', reserveController.renderReserveDish);
router.get('/table', reserveController.renderReserveTable);
router.get('/history', reserveController.renderReserveHistory);
router.get('/getReserveDish/:userID', reserveController.getReserveDishByUserID);
router.post('/dishSubmit', reserveController.submitReserveDish);
router.post('/tableSubmit', reserveController.submitReserveTable);

router.get('/getReserveTable/:userID', reserveController.getReserveTableByUserID);
module.exports = router;