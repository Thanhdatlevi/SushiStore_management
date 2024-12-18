const express = require("express");
const route = express.Router();
const menuController = require("../../controllers/admin/menu.controller");

route.get('/', menuController.getMenuPage);
route.get('/filter', menuController.getMenuPage);

route.get('/add', menuController.renderAddDishForm);
// route.post('/add', menuController.addDish);
//----------------
// route.post('/add', menuController.addDishToBranch);

//
// ===== Add Dish =====
route.post("/add", menuController.addDishToBranch); 

route.get("/branches", menuController.getBranchesByRegion); 
//----------------

route.get('/edit/:id', menuController.renderEditDishForm);
route.post('/edit/:id', menuController.editDish);

route.post('/delete/:id', menuController.deleteDish);

route.get('/search', menuController.searchDish);




module.exports = route;