const express = require('express');
const router = express.Router();
const branchController = require('../../modules/Customer/branch/branchController');

router.get('/', branchController.getAllBranch);

router.get('/diliveryBranch', branchController.getdiliveryBranch);

module.exports = router;