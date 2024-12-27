const mssql = require('mssql');
const config = {
    server: "localhost",
    user: "sa",
    password: "123",
    // database: "db_sushi3",
    database: "db_sushi4",
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