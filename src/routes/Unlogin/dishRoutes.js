const express = require('express');
const router = express.Router();
const loginController = require('../../modules/Unlogin/dish/dishController');

router.get('/', loginController.getAllDish);

router.get('/getDishbyBranch/:idBranch', loginController.getDishbyBranch);

router.get('/api', loginController.getAllFilterDish);
module.exports = router;