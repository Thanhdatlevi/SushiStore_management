const express = require('express');
const router = express.Router();
const dishController = require('../../modules/Employee/dish/dishController');

router.get('/', dishController.getAllDish);

router.get('/getDishbyEmployeeID', dishController.getDishbyBranch);

router.get('/api', dishController.getAllFilterDish);

router.get('/getOrderKVDish', dishController.getOrderKVDish);

router.post('/deleteByEmployee', dishController.deleteByEmployee);

router.post('/updateDelivery', dishController.updateDelivery);

router.post('/addDishToBranch', dishController.addDishToBranch);
module.exports = router;