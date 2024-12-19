const express = require('express');
const router = express.Router();
const dishController = require('../../modules/Customer/dish/dishController');

router.get('/', dishController.getAllDish);

router.get('/getDishbyBranch/:idBranch', dishController.getDishbyBranch);

router.get('/getDishGHbyBranch/:idBranch', dishController.getDishGHbyBranch);

router.get('/api', dishController.getAllFilterDish);
module.exports = router;