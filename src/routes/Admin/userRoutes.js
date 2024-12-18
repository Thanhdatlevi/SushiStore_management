const express = require('express');
const route = express.Router();
const userController = require("../../modules/Admin/userController");

route.get('/', userController.getUsers);

route.get('/add', userController.getFormAddUsers);
route.post('/add', userController.addCard);

route.post('/delete/:MaThe', userController.deleteCard);

route.get('/edit/:MaThe',userController.getEditCard);
route.post('/edit/:MaThe', userController.editCard);

route.get('/search', userController.searchUsers);

module.exports = route;