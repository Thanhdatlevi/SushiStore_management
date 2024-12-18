const express = require("express");
const route = express.Router();
const employeeController = require("../../controllers/admin/employee.controller");

route.get('/', employeeController.getAllEmployees);

route.get('/add',employeeController.showAddEmployeeForm);
route.post('/add', employeeController.addEmployee); 

route.get('/edit/:id', employeeController.getEmployeeById); 
route.post('/edit/:id', employeeController.editEmployee); 

route.post('/delete/:id', employeeController.deleteEmployee); 

route.get('/search', employeeController.searchEmployee); 

module.exports = route;
