const branchRoutes = require("./branchRoutes");
const dishRoutes = require("./dishRoutes");
const reserveRoutes = require("./reserveRoutes");
const viewsRoutes = require("./viewsRoutes");


module.exports = (app) => {

    app.use('/customer',viewsRoutes)

    app.use('/customer/dish', dishRoutes)

    app.use('/customer/reserve', reserveRoutes)    

    app.use('/customer/branch', branchRoutes)
}