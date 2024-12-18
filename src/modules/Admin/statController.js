const sql = require("mssql");
const {poolPromise } = require("../../config/db");


module.exports.statForm = async (req, res) => {
  try {
    res.render("AdminPage/statForm", {
      layout: "Admin/AdminMain",
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

    res.render("AdminPage/dailyStat", {
      layout: "Admin/AdminMain",
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
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }

    res.render("AdminPage/dailyStat", {
      layout: "Admin/AdminMain",
      title: "Employee Management",
      chinhanh: result.recordset,
      doanhthu: doanhthuRes.recordset,
    });
  } catch (err) {
    console.log("encountered error: ", err);
  }
};

module.exports.monthlyStatForm = async (req, res) => {
  try {
    const pool = await poolPromise;

    result = await pool
      .request()
      .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");

    res.render("AdminPage/monthlyStat", {
      layout: "Admin/AdminMain",
      title: "Employee Management",
      chinhanh: result.recordset,
    });
  } catch (err) {}
};

module.exports.monthlyStat = async (req, res) => {
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
        "EXEC xem_doanh_thu_chi_nhanh_thang @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
      );

    for (let i = 0; i < doanhthuRes.recordset.length; i++) {
      let date = doanhthuRes.recordset[i].Ngay;
      date = new Date(date);
      doanhthuRes.recordset[i].Ngay =
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }

    res.render("AdminPage/monthlyStat", {
      layout: "Admin/AdminMain",
      title: "Employee Management",
      chinhanh: result.recordset,
      doanhthu: doanhthuRes.recordset,
    });
  } catch (err) {
  }
};

module.exports.quarterlyStatForm = async (req, res) => {
  try {
    const pool = await poolPromise;

    result = await pool
      .request()
      .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");

    res.render("AdminPage/quarterlyStat", {
      layout: "Admin/AdminMain",
      title: "Employee Management",
      chinhanh: result.recordset,
    });
  } catch (err) {}
};

module.exports.quarterlyStat = async (req, res) => {
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
        "EXEC xem_doanh_thu_chi_nhanh_quy @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
      );

    for (let i = 0; i < doanhthuRes.recordset.length; i++) {
      let date = doanhthuRes.recordset[i].Ngay;
      date = new Date(date);
      doanhthuRes.recordset[i].Ngay =
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }

    res.render("AdminPage/quarterlyStat", {
      layout: "Admin/AdminMain",
      title: "Employee Management",
      chinhanh: result.recordset,
      doanhthu: doanhthuRes.recordset,
    });
  } catch (err) {
  }
};

module.exports.yearlyStatForm = async (req, res) => {
  try {
    const pool = await poolPromise;

    result = await pool
      .request()
      .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");

    res.render("AdminPage/yearlyStat", {
      layout: "Admin/AdminMain",
      title: "Employee Management",
      chinhanh: result.recordset,
    });
  } catch (err) {}
};

module.exports.yearlyStat = async (req, res) => {
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
        "EXEC xem_doanh_thu_chi_nhanh_nam @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
      );

    for (let i = 0; i < doanhthuRes.recordset.length; i++) {
      let date = doanhthuRes.recordset[i].Ngay;
      date = new Date(date);
      doanhthuRes.recordset[i].Ngay =
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }

    res.render("AdminPage/yearlyStat", {
      layout: "Admin/AdminMain",
      title: "Employee Management",
      chinhanh: result.recordset,
      doanhthu: doanhthuRes.recordset,
    });
  } catch (err) {
  }
};