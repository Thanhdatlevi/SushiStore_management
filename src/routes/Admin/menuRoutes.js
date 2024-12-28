const express = require("express");
const route = express.Router();
const menuController = require("../../modules/Admin/menuController");

route.get('/', menuController.getMenuPage);
route.get('/filter', menuController.getMenuPage);

// Route thêm món ăn
route.get('/add', menuController.renderAddDishForm);
route.post('/add', menuController.addDish);

// thêm món ăn chi nhánh
route.get('/add/branches', menuController.renderAddDishToBranchesForm);
route.post('/add/branches', menuController.addDishToBranch);

// thêm món ăn khu vuẹc
route.get('/add/region', menuController.renderAddDishToRegionForm);
route.post('/add/region', menuController.addDishToRegion);

// sửa món ăn
route.get('/edit/:id', menuController.renderEditDishForm);
route.post('/edit/:id', menuController.editDish);

// xoá món ăn
route.post('/delete/:id', menuController.deleteDish);

// tìm kiếm món ăn
route.get('/search', menuController.searchDish);

module.exports = route;