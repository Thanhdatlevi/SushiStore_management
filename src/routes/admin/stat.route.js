const express = require("express");
const route = express.Router();
const statController = require("../../controllers/admin/stat.controller");

route.get("/", statController.statForm);

route.get("/daily", statController.dailyStatForm)
route.post("/daily", statController.dailyStat);

route.get("/monthly", statController.monthlyStatForm);
route.post("/monthly", statController.monthlyStat);
//
// route.get("/quarterly", statController.quarterlyStatForm);
// route.post("/quarterly", statController.quarterlyStat);
//
// route.get("/yearly", statController.yearlyStatForm);
// route.post("/yearly", statController.yearlyStat);

module.exports = route;
