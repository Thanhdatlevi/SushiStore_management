const express = require("express");
const route = express.Router();
const branchesController = require("../../controllers/admin/branches.controller");
const branchController = require("../../controllers/admin/branches.controller");

route.get('/', branchController.getAllBranches);
route.get('/add', branchController.showAddBranchForm);
route.post('/add', branchController.addBranch);
route.get('/edit/:id', branchController.showEditBranchForm);
route.post('/edit/:id', branchController.editBranch);
route.post('/delete/:id', branchController.deleteBranch);


module.exports = route