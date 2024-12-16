const sql = require("mssql");
const rls = require("readline-sync");

var tempPass = rls.question("database password: ", { hideEchoBack: true });

// test connect
const sqlConfig = {
  user: "sa", // Tên người dùng của SQL Server (trong trường hợp này là tài khoản 'sa')
  password: tempPass, // Mật khẩu tài khoản 'sa'
  database: "SushiStore_management", // Tên cơ sở dữ liệu muốn kết nối
  server: "localhost", // Sử dụng 'localhost' vì SQL Server đang chạy trong container Docker trên máy của bạn
  port: 1433, // Cổng mặc định SQL Server
  options: {
    encrypt: true, // Đặt là true nếu bạn kết nối qua Azure, false cho kết nối local
    trustServerCertificate: true, // Đặt true nếu sử dụng chứng chỉ tự ký trong môi trường phát triển local
  },
};

// Tạo kết nối với SQL Server
const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then((pool) => {
    console.log("Kết nối đến SQL Server thành công!");
    return pool;
  })
  .catch((err) => {
    console.error("Lỗi khi kết nối tới SQL Server:", err);
    process.exit(1);
  });

module.exports = {
  poolPromise: poolPromise,
  sqlConfig: sqlConfig,
};

