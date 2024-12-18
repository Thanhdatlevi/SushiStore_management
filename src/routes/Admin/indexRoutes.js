const dashboardRoutes = require("./dashboardRoutes");
const branchesRoute = require("./branchRoutes");
const employeeRoute = require("./employeeRoutes");
const menuRoute = require("./menuRoutes");
const statRoute = require("./statRoutes");
const reportRoute = require("./reportRoutes");
const userRoute = require("./userRoutes");

module.exports = (app) => {
  app.use("/admin", dashboardRoutes);

  app.use("/admin/dashboard", dashboardRoutes);

  app.use("/admin/branches", branchesRoute);

  app.use("/admin/employees", employeeRoute);

  app.use("/admin/menu", menuRoute);

  app.use("/admin/stat", statRoute);

  app.use('/admin/reports', reportRoute) 

  app.use('/admin/users', userRoute)
};