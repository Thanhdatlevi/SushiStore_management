const express = require("express");
const route = express.Router();
const reportController = require("../../modules/Admin/reportController");  

// 
route.get("/", reportController.statForm);

//cho món bán chậm nhất
route.get('/food/slowest-branch', reportController.getSlowestDishByBranch);
route.get('/food/slowest-region', reportController.getSlowestDishByRegion);
route.get('/food/slowest-branch-date', reportController.getSlowestDishByBranchAndDate);

// món best seller
route.get('/food/most-branch', reportController.getMostSoldDishByBranch );
route.get('/food/most-region', reportController.getMostSoldDishByRegion );
route.get('/food/most-branch-date', reportController.getMostSoldDishByBranchAndDate );

// doanh thu
route.get("/daily", reportController.dailyStatForm)
route.post("/daily", reportController.dailyStat);

route.get("/monthly", reportController.monthlyStatForm);
route.post("/monthly", reportController.monthlyStat);
//
route.get("/quarterly", reportController.quarterlyStatForm);
route.post("/quarterly", reportController.quarterlyStat);
//
route.get("/yearly", reportController.yearlyStatForm);
route.post("/yearly", reportController.yearlyStat);

module.exports = route;