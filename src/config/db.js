const mssql = require('mssql');
// Thiết lập kết nối với MySQL
const config = {
    server: "localhost",
    user: "sa",
    password: "123",
    database: "db_sushi3",
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