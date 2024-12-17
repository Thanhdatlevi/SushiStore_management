const mssql = require('mssql');
// Thiết lập kết nối với MySQL
const config = {
    server: "localhost",
    user: "dat",
    password: "1234@",
    database: "SushiStore_management",
    driver: "mssql",
    options:{
        encrypt: false,
        enableArithAbort: false,
    }
};

const pool = new mssql.ConnectionPool(config)

module.exports = {
    pool,
};