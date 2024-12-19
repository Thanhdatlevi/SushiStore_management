const dishRoutes = require("./dishRoutes");
const viewsRoutes = require("./viewsRoutes");
const loginRoutes = require("./loginRoutes");
const branchRoutes = require("./branchRoutes");

module.exports = (app) => {

    app.use('/',viewsRoutes)

    app.use('/dish', dishRoutes)
    
    app.use('/branch',branchRoutes)

    app.use('/login', loginRoutes)
}