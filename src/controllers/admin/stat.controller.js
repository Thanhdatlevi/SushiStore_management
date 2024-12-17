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

module.exports.dailyStat = async (req, res) => {
  try {
    const pool = await poolPromise;

    result = await pool
      .request()
      .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");

    let { MaCN, Ngay1, Ngay2 } = req.query;

    doanhthuRes = await pool
      .request()
      .input("CN", sql.Int, MaCN)
      .input("N1", sql.Date, Ngay1)
      .input("N2", sql.Date, Ngay2)
      .query(
        "EXEC xem_doanh_thu_chi_nhanh @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
      );

    console.log(doanhthuRes.recordset)

    res.render("admin/pages/dailyStat", {
      layout: "admin_layouts/mainAdmin",
      title: "Employee Management",
      chinhanh: result.recordset,
      doanhthu: doanhthuRes.recordset,
    });
  } catch (err) {
    console.log("encountered error: ", err);
  }
};
