const sql = require("mssql");
const { sqlConfig, poolPromise } = require("../../config/database");

const Handlebars = require("handlebars");

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

    let { MaCN, Ngay1, Ngay2 } = req.body;

    doanhthuRes = await pool
      .request()
      .input("CN", sql.Int, MaCN)
      .input("N1", sql.Date, Ngay1)
      .input("N2", sql.Date, Ngay2)
      .query(
        "EXEC xem_doanh_thu_chi_nhanh @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
      );

    console.log(typeof doanhthuRes.recordset);
    console.log(doanhthuRes.recordset[1].Ngay);

    for (let i = 0; i < doanhthuRes.recordset.length; i++) {
      let date = doanhthuRes.recordset[i].Ngay;
      date = new Date(date);
      doanhthuRes.recordset[i].Ngay =
        date.getDate() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        date.getFullYear();
    }

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
