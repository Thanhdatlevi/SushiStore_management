const dishRoutes = require("./dishRoutes");
const reserveRoutes = require("./reserveRoutes");
const viewsRoutes = require("./viewsRoutes");


module.exports = (app) => {

    app.use('/employee',viewsRoutes)

    app.use('/employee/dish', dishRoutes)

    app.use('/employee/reserve', reserveRoutes)
}