const mssql = require('mssql');
const config = {
    server: "localhost",
    user: "dat",
    password: "1234@",
    // database: "db_sushi3",
    database: "SushiStore_management",
    driver: "mssql",
    options:{
        encrypt: false,
        enableArithAbort: false,
    }
};

const poolPromise = new mssql.ConnectionPool(config).connect()

module.exports = {
    config,
    poolPromise,
};