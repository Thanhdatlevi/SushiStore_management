const sql = require("mssql");
const { sqlConfig, poolPromise } = require("../../config/database");

module.exports.statForm = async (req, res) => {
  try {
    res.render("admin/pages/statForm", {
      layout: "admin_layouts/mainAdmin",
      title: "Employee Management",
    });
  } catch (err) {}
};

module.exports.dailyStatForm = async (req, res) => {
  try {
    const pool = await poolPromise;

    result = await pool
      .request()
      .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
    res.render("admin/pages/dailyStat", {
      layout: "admin_layouts/mainAdmin",
      title: "Employee Management",
      chinhanh: result.recordset,
    });
  } catch (err) {}
};
