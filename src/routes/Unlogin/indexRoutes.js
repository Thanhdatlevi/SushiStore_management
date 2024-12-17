const dishRoutes = require("./dishRoutes");
const viewsRoutes = require("./viewsRoutes");
const loginRoutes = require("./loginRoutes");


module.exports = (app) => {

    app.use('/',viewsRoutes)

    app.use('/dish', dishRoutes)

    app.use('/login', loginRoutes)
}