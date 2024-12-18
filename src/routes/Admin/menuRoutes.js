const express = require("express");
const route = express.Router();
const menuController = require("../../modules/Admin/menuController");

route.get('/', menuController.getMenuPage);
route.get('/filter', menuController.getMenuPage);

// Route thêm món ăn
route.get('/add', menuController.renderAddDishForm);
route.post('/add', menuController.addDish);

// Route sửa món ăn
route.get('/edit/:id', menuController.renderEditDishForm);
route.post('/edit/:id', menuController.editDish);

// Route xoá món ăn
route.post('/delete/:id', menuController.deleteDish);

// Route tìm kiếm món ăn
route.get('/search', menuController.searchDish);

module.exports = route;