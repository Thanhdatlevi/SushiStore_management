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

module.exports.dailyForm = async (req, res) => {
  try {
    res.render("admin/pages/dailyStat", {
      layout: "admin_layouts/mainAdmin",
      title: "Employee Management",
    });
  } catch (err) {}
};
