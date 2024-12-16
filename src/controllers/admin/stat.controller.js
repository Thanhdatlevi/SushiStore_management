const sql = require("mssql");
const { sqlConfig, poolPromise } = require("../../config/database");

module.exports.statForm = async (req, res) => {
  try {
    res.render("admin/pages/dailyStat", {
      layout: "admin_layouts/mainAdmin",
      title: "Employee Management",
      employees: result.recordset, // Danh sách nhân viên
      branches: branches.recordset, // Danh sách chi nhánh
      MaChiNhanh, // Để giữ trạng thái đã chọn
    });
  } catch (err) {}
};
