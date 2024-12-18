const dashboardRoutes = require("./dashboard.route");
const branchesRoute = require("./branches.route");
const employeeRoute = require("./employee.route");
const reportRoute = require("./reports.route");
const menuRoute = require("./menu.route");
const userRoute = require("./users.route");


module.exports = (app) => {

    app.use('/admin/dashboard',dashboardRoutes)

    app.use('/admin/branches', branchesRoute)

    app.use('/admin/employees', employeeRoute)    

    app.use('/admin/reports', reportRoute)    

    app.use('/admin/menu', menuRoute)

    app.use('/admin/users', userRoute)

    
}