const express = require("express");
const route = express.Router();
const branchController = require("../../modules/Admin/branchesController");

route.get('/', branchController.getAllBranches);
route.get('/add', branchController.showAddBranchForm);
route.post('/add', branchController.addBranch);
route.get('/edit/:id', branchController.showEditBranchForm);
route.post('/edit/:id', branchController.editBranch);
route.post('/delete/:id', branchController.deleteBranch);


module.exports = route