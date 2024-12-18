
// controllers/admin/report.controller.js
const sql = require('mssql');
const { poolPromise } = require("../../config/database");

const getBranchAndRevenue = async (queryProc, MaCN, Ngay1, Ngay2, type) => {
    const pool = await poolPromise;

    // Lấy danh sách chi nhánh
    const branchResult = await pool
      .request()
      .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");

    // Truy xuất doanh thu với stored procedure
    const revenueResult = await pool
      .request()
      .input("CN", sql.Int, MaCN)
      .input("N1", sql.Date, Ngay1)
      .input("N2", sql.Date, Ngay2)
      .query(queryProc);

    // Format dữ liệu theo loại thống kê
    revenueResult.recordset.forEach((item) => {
      const date = new Date(item.Ngay); // Ngày gốc từ DB

      if (type === "day") {
        // Thống kê theo ngày
        item.Ngay = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (type === "month") {
        // Thống kê theo tháng và năm
        item.Ngay = `${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (type === "quarter") {
        // Tính quý và lấy năm
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        item.Ngay = `Q${quarter} - ${date.getFullYear()}`;
      } else if (type === "year") {
        // Thống kê theo năm
        item.Ngay = `${date.getFullYear()}`;
      }
    });

    return { chinhanh: branchResult.recordset, doanhthu: revenueResult.recordset };
  };

//--------------------------------------------------------------------
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
  
//   module.exports.dailyStat = async (req, res) => {
//     try {
//       const pool = await poolPromise;
  
//       result = await pool
//         .request()
//         .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
  
//       let { MaCN, Ngay1, Ngay2 } = req.body;
  
//       doanhthuRes = await pool
//         .request()
//         .input("CN", sql.Int, MaCN)
//         .input("N1", sql.Date, Ngay1)
//         .input("N2", sql.Date, Ngay2)
//         .query(
//           "EXEC xem_doanh_thu_chi_nhanh @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
//         );
  
//       console.log(typeof doanhthuRes.recordset);
//       console.log(doanhthuRes.recordset[1].Ngay);
  
//       for (let i = 0; i < doanhthuRes.recordset.length; i++) {
//         let date = doanhthuRes.recordset[i].Ngay;
//         date = new Date(date);
//         doanhthuRes.recordset[i].Ngay =
//           date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
//       }
  
//       res.render("admin/pages/dailyStat", {
//         layout: "admin_layouts/mainAdmin",
//         title: "Employee Management",
//         chinhanh: result.recordset,
//         doanhthu: doanhthuRes.recordset,
//       });
//     } catch (err) {
//       console.log("encountered error: ", err);
//     }
//   };
  
  module.exports.monthlyStatForm = async (req, res) => {
    try {
      const pool = await poolPromise;
  
      result = await pool
        .request()
        .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
  
      res.render("admin/pages/monthlyStat", {
        layout: "admin_layouts/mainAdmin",
        title: "Employee Management",
        chinhanh: result.recordset,
      });
    } catch (err) {}
  };
  
//   module.exports.monthlyStat = async (req, res) => {
//     try {
//       const pool = await poolPromise;
  
//       result = await pool
//         .request()
//         .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
  
//       let { MaCN, Ngay1, Ngay2 } = req.body;
  
//       doanhthuRes = await pool
//         .request()
//         .input("CN", sql.Int, MaCN)
//         .input("N1", sql.Date, Ngay1)
//         .input("N2", sql.Date, Ngay2)
//         .query(
//           "EXEC xem_doanh_thu_chi_nhanh_thang @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
//         );
  
//       for (let i = 0; i < doanhthuRes.recordset.length; i++) {
//         let date = doanhthuRes.recordset[i].Ngay;
//         date = new Date(date);
//         doanhthuRes.recordset[i].Ngay =
//           date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
//       }
  
//       res.render("admin/pages/monthlyStat", {
//         layout: "admin_layouts/mainAdmin",
//         title: "Employee Management",
//         chinhanh: result.recordset,
//         doanhthu: doanhthuRes.recordset,
//       });
//     } catch (err) {
//     }
//   };
  
  module.exports.quarterlyStatForm = async (req, res) => {
    try {
      const pool = await poolPromise;
  
      result = await pool
        .request()
        .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
  
      res.render("admin/pages/quarterlyStat", {
        layout: "admin_layouts/mainAdmin",
        title: "Employee Management",
        chinhanh: result.recordset,
      });
    } catch (err) {}
  };
  
//   module.exports.quarterlyStat = async (req, res) => {
//     try {
//       const pool = await poolPromise;
  
//       result = await pool
//         .request()
//         .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
  
//       let { MaCN, Ngay1, Ngay2 } = req.body;
  
//       doanhthuRes = await pool
//         .request()
//         .input("CN", sql.Int, MaCN)
//         .input("N1", sql.Date, Ngay1)
//         .input("N2", sql.Date, Ngay2)
//         .query(
//           "EXEC xem_doanh_thu_chi_nhanh_quy @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
//         );
  
//       for (let i = 0; i < doanhthuRes.recordset.length; i++) {
//         let date = doanhthuRes.recordset[i].Ngay;
//         date = new Date(date);
//         doanhthuRes.recordset[i].Ngay =
//           date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
//       }
  
//       res.render("admin/pages/quarterlyStat", {
//         layout: "admin_layouts/mainAdmin",
//         title: "Employee Management",
//         chinhanh: result.recordset,
//         doanhthu: doanhthuRes.recordset,
//       });
//     } catch (err) {
//     }
//   };
  
  module.exports.yearlyStatForm = async (req, res) => {
    try {
      const pool = await poolPromise;
  
      result = await pool
        .request()
        .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
  
      res.render("admin/pages/yearlyStat", {
        layout: "admin_layouts/mainAdmin",
        title: "Employee Management",
        chinhanh: result.recordset,
      });
    } catch (err) {}
  };
  
//   module.exports.yearlyStat = async (req, res) => {
//     try {
//       const pool = await poolPromise;
  
//       result = await pool
//         .request()
//         .query("SELECT cn.MaCN, cn.TenCN FROM chi_nhanh cn");
  
//       let { MaCN, Ngay1, Ngay2 } = req.body;
  
//       doanhthuRes = await pool
//         .request()
//         .input("CN", sql.Int, MaCN)
//         .input("N1", sql.Date, Ngay1)
//         .input("N2", sql.Date, Ngay2)
//         .query(
//           "EXEC xem_doanh_thu_chi_nhanh_nam @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
//         );
  
//       for (let i = 0; i < doanhthuRes.recordset.length; i++) {
//         let date = doanhthuRes.recordset[i].Ngay;
//         date = new Date(date);
//         doanhthuRes.recordset[i].Ngay =
//           date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
//       }
  
//       res.render("admin/pages/yearlyStat", {
//         layout: "admin_layouts/mainAdmin",
//         title: "Employee Management",
//         chinhanh: result.recordset,
//         doanhthu: doanhthuRes.recordset,
//       });
//     } catch (err) {
//     }
//   };


module.exports.dailyStat = async (req, res) => {
    try {
      const { MaCN, Ngay1, Ngay2 } = req.body;
      const data = await getBranchAndRevenue(
        "EXEC xem_doanh_thu_chi_nhanh @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
        MaCN,
        Ngay1,
        Ngay2,
        "day" 
      );
  
      res.render("admin/pages/dailyStat", {
        layout: "admin_layouts/mainAdmin",
        title: "Daily Revenue Statistics",
        ...data,
      });
    } catch (err) {
      console.error("Error fetching daily stats:", err);
    }
  };
  
  module.exports.monthlyStat = async (req, res) => {
    try {
      const { MaCN, Ngay1, Ngay2 } = req.body;
      const data = await getBranchAndRevenue(
        "EXEC xem_doanh_thu_chi_nhanh_thang @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
        MaCN,
        Ngay1,
        Ngay2,
        "month" 
      );
  
      res.render("admin/pages/monthlyStat", {
        layout: "admin_layouts/mainAdmin",
        title: "Monthly Revenue Statistics",
        ...data,
      });
    } catch (err) {
      console.error("Error fetching monthly stats:", err);
    }
  };
  
  module.exports.quarterlyStat = async (req, res) => {
    try {
      const { MaCN, Ngay1, Ngay2 } = req.body;
      const data = await getBranchAndRevenue(
        "EXEC xem_doanh_thu_chi_nhanh_quy @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
        MaCN,
        Ngay1,
        Ngay2,
        "quarter" 
      );
  
      res.render("admin/pages/quarterlyStat", {
        layout: "admin_layouts/mainAdmin",
        title: "Quarterly Revenue Statistics",
        ...data,
      });
    } catch (err) {
      console.error("Error fetching quarterly stats:", err);
    }
  };
  
  module.exports.yearlyStat = async (req, res) => {
    try {
      const { MaCN, Ngay1, Ngay2 } = req.body;
      const data = await getBranchAndRevenue(
        "EXEC xem_doanh_thu_chi_nhanh_nam @MaCN = @CN, @Ngay1 = @N1, @Ngay2 = @N2",
        MaCN,
        Ngay1,
        Ngay2,
        "year" 
      );
  
      res.render("admin/pages/yearlyStat", {
        layout: "admin_layouts/mainAdmin",
        title: "Yearly Revenue Statistics",
        ...data,
      });
    } catch (err) {
      console.error("Error fetching yearly stats:", err);
    }
  };
  

//--------------------------------------------------------------------

// a. Món bán chậm nhất theo chi nhánh
module.exports.getSlowestDishByBranch = async (req, res) => {
    const { branchId } = req.query;

    try {
        const pool = await poolPromise;

        let query = `
            SELECT 
                ma.TenMon, pd.MaCN, SUM(mmpd.SoLuong) AS SoLuong
            FROM 
                phieu_dat pd
            JOIN 
                ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
            JOIN 
                mon_an ma ON mmpd.MaMon = ma.MaMon
        `;

        if (branchId) {
            query += ` WHERE pd.MaCN = @BranchId `;
        }

        query += `
            GROUP BY ma.TenMon, pd.MaCN
            HAVING SUM(mmpd.SoLuong) >= ALL (
                SELECT SUM(mmpd2.SoLuong)
                FROM phieu_dat pd2
                JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
                WHERE pd2.MaCN = pd.MaCN
                GROUP BY mmpd2.MaMon
            )
        `;

        const request = pool.request();
        if (branchId) request.input('BranchId', sql.Int, branchId);

        const result = await request.query(query);

        const branches = await pool.request().query(`SELECT MaCN, TenCN FROM chi_nhanh`);

        res.render('admin/pages/slowestDishes', {
            title: 'Slowest Selling Dish - By Branch',
            layout: 'admin_layouts/mainAdmin',
            dishes: result.recordset,
            branches: branches.recordset,
            selectedBranch: branchId,
            filter: 'branch',
        });
    } catch (error) {
        console.error('Error fetching slowest dish by branch:', error);
        res.status(500).send('Error fetching data');
    }
};


// b. Món bán chậm nhất theo khu vực
module.exports.getSlowestDishByRegion = async (req, res) => {
    const { regionId } = req.query;

    try {
        const pool = await poolPromise;

        let query = `
            SELECT 
                ma.TenMon, kv.TenKhuVuc, kv.MaKhuVuc, SUM(mmpd.SoLuong) AS SoLuong
            FROM 
                phieu_dat pd
            JOIN 
                ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
            JOIN 
                mon_an ma ON mmpd.MaMon = ma.MaMon
            JOIN 
                chi_nhanh cn ON pd.MaCN = cn.MaCN
            JOIN 
                khu_vuc kv ON cn.MaKhuVuc = kv.MaKhuVuc
        `;
        if (regionId) {
            query += ` WHERE kv.MaKhuVuc = @RegionId`;
        }

        query += `
            GROUP BY 
                ma.TenMon, kv.TenKhuVuc, kv.MaKhuVuc
            HAVING 
                SUM(mmpd.SoLuong) >= ALL (
                    SELECT SUM(mmpd2.SoLuong)
                    FROM phieu_dat pd2
                    JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
                    JOIN chi_nhanh cn2 ON pd2.MaCN = cn2.MaCN
                    JOIN khu_vuc kv2 ON cn2.MaKhuVuc = kv2.MaKhuVuc
                    WHERE kv2.MaKhuVuc = kv.MaKhuVuc
                    GROUP BY mmpd2.MaMon
                )
        `;

        const request = pool.request();
        if (regionId) request.input('RegionId', sql.Int, regionId);

        const result = await request.query(query);

        const regions = await pool.request().query(`SELECT MaKhuVuc, TenKhuVuc FROM khu_vuc`);

        res.render('admin/pages/slowestDishes', {
            title: 'Slowest Selling Dish - By Region',
            layout: 'admin_layouts/mainAdmin',
            dishes: result.recordset,
            regions: regions.recordset,
            selectedRegion: regionId,
            filter: 'region',
        });
    } catch (error) {
        console.error('Error fetching slowest dish by region:', error);
        res.status(500).send('Error fetching data');
    }
};


// c. Món bán chậm nhất theo chi nhánh trong khoảng thời gian
module.exports.getSlowestDishByBranchAndDate = async (req, res) => {
    let { startDate, endDate, branchId } = req.query;

    try {
        const pool = await poolPromise;

        if (!startDate || isNaN(Date.parse(startDate))) {
            startDate = new Date().toISOString().split('T')[0]; 
        }
        if (!endDate || isNaN(Date.parse(endDate))) {
            endDate = new Date().toISOString().split('T')[0]; 
        }

        let query = `
            SELECT 
                ma.TenMon, pd.MaCN, SUM(mmpd.SoLuong) AS SoLuong
            FROM 
                phieu_dat pd
            JOIN 
                ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
            JOIN 
                mon_an ma ON mmpd.MaMon = ma.MaMon
        `;

        // lọc theo ngày và chi nhánh
        const conditions = [];
        if (startDate && endDate) {
            conditions.push("pd.NgayDat BETWEEN @StartDate AND @EndDate");
        }
        if (branchId) {
            conditions.push("pd.MaCN = @BranchId");
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += `
            GROUP BY 
                ma.TenMon, pd.MaCN
            HAVING 
                SUM(mmpd.SoLuong) >= ALL (
                    SELECT SUM(mmpd2.SoLuong)
                    FROM phieu_dat pd2
                    JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
                    WHERE pd2.MaCN = pd.MaCN
                    ${startDate && endDate ? "AND pd2.NgayDat BETWEEN @StartDate AND @EndDate" : ""}
                    GROUP BY mmpd2.MaMon
                )
        `;

        const request = pool.request();
        request.input('StartDate', sql.Date, startDate);
        request.input('EndDate', sql.Date, endDate);

        if (branchId) {
            request.input('BranchId', sql.Int, branchId);
        }

        const result = await request.query(query);

        // danh sách chi nhánh
        const branches = await pool.request().query(`SELECT MaCN, TenCN FROM chi_nhanh`);

        res.render('admin/pages/slowestDishes', {
            title: 'Slowest Selling Dish - By Branch and Date Range',
            layout: 'admin_layouts/mainAdmin',
            dishes: result.recordset,
            branches: branches.recordset,
            startDate,
            endDate,
            selectedBranch: branchId,
            filter: 'branch-date',
        });
    } catch (error) {
        console.error('Error fetching slowest dish by branch and date:', error);
        res.status(500).send('Error fetching data');
    }
};


// CÁC MÓN ĂN BEST SELLERS
// a. món bán nhiêuf nhất theo chi nhánh
module.exports.getMostSoldDishByBranch = async (req, res) => {
    const { branchId } = req.query;

    try {
        const pool = await poolPromise;

        let query = `
            SELECT 
                ma.TenMon, pd.MaCN, SUM(mmpd.SoLuong) AS SoLuong
            FROM 
                phieu_dat pd
            JOIN 
                ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
            JOIN 
                mon_an ma ON mmpd.MaMon = ma.MaMon
        `;

        if (branchId) {
            query += ` WHERE pd.MaCN = @BranchId `;
        }

        query += `
            GROUP BY ma.TenMon, pd.MaCN
            HAVING SUM(mmpd.SoLuong) = (
                SELECT MAX(total)
                FROM (
                    SELECT SUM(mmpd2.SoLuong) AS total
                    FROM phieu_dat pd2
                    JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
                    WHERE pd2.MaCN = pd.MaCN
                    GROUP BY mmpd2.MaMon
                ) AS totals
            )
        `;

        const request = pool.request();
        if (branchId) request.input('BranchId', sql.Int, branchId);

        const result = await request.query(query);

        const branches = await pool.request().query(`SELECT MaCN, TenCN FROM chi_nhanh`);

        res.render('admin/pages/mostSoldDishes', {
            title: 'Most Sold Dish - By Branch',
            layout: 'admin_layouts/mainAdmin',
            dishes: result.recordset,
            branches: branches.recordset,
            selectedBranch: branchId,
            filter: 'branch',
        });
    } catch (error) {
        console.error('Error fetching most sold dish by branch:', error);
        res.status(500).send('Error fetching data');
    }
};

// b. most sold dish by region
module.exports.getMostSoldDishByRegion = async (req, res) => {
    const { regionId } = req.query;

    try {
        const pool = await poolPromise;

        let query = `
            SELECT 
                ma.TenMon, kv.TenKhuVuc, kv.MaKhuVuc, SUM(mmpd.SoLuong) AS SoLuong
            FROM 
                phieu_dat pd
            JOIN 
                ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
            JOIN 
                mon_an ma ON mmpd.MaMon = ma.MaMon
            JOIN 
                chi_nhanh cn ON pd.MaCN = cn.MaCN
            JOIN 
                khu_vuc kv ON cn.MaKhuVuc = kv.MaKhuVuc
        `;

        if (regionId) {
            query += ` WHERE kv.MaKhuVuc = @RegionId `;
        }

        query += `
            GROUP BY ma.TenMon, kv.TenKhuVuc, kv.MaKhuVuc
            HAVING SUM(mmpd.SoLuong) = (
                SELECT MAX(total)
                FROM (
                    SELECT SUM(mmpd2.SoLuong) AS total
                    FROM phieu_dat pd2
                    JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
                    JOIN chi_nhanh cn2 ON pd2.MaCN = cn2.MaCN
                    JOIN khu_vuc kv2 ON cn2.MaKhuVuc = kv2.MaKhuVuc
                    WHERE kv2.MaKhuVuc = kv.MaKhuVuc
                    GROUP BY mmpd2.MaMon
                ) AS totals
            )
        `;

        const request = pool.request();
        if (regionId) request.input('RegionId', sql.Int, regionId);

        const result = await request.query(query);

        const regions = await pool.request().query(`SELECT MaKhuVuc, TenKhuVuc FROM khu_vuc`);

        res.render('admin/pages/mostSoldDishes', {
            title: 'Most Sold Dish - By Region',
            layout: 'admin_layouts/mainAdmin',
            dishes: result.recordset,
            regions: regions.recordset,
            selectedRegion: regionId,
            filter: 'region',
        });
    } catch (error) {
        console.error('Error fetching most sold dish by region:', error);
        res.status(500).send('Error fetching data');
    }
};

// c. most sold dish by branch and date range
module.exports.getMostSoldDishByBranchAndDate = async (req, res) => {
    let { startDate, endDate, branchId } = req.query;

    try {
        const pool = await poolPromise;

        if (!startDate || isNaN(Date.parse(startDate))) {
            startDate = new Date().toISOString().split('T')[0];
        }
        if (!endDate || isNaN(Date.parse(endDate))) {
            endDate = new Date().toISOString().split('T')[0];
        }

        let query = `
            SELECT 
                ma.TenMon, pd.MaCN, SUM(mmpd.SoLuong) AS SoLuong
            FROM 
                phieu_dat pd
            JOIN 
                ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
            JOIN 
                mon_an ma ON mmpd.MaMon = ma.MaMon
        `;

        const conditions = [];
        if (startDate && endDate) {
            conditions.push("pd.NgayDat BETWEEN @StartDate AND @EndDate");
        }
        if (branchId) {
            conditions.push("pd.MaCN = @BranchId");
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += `
            GROUP BY ma.TenMon, pd.MaCN
            HAVING SUM(mmpd.SoLuong) = (
                SELECT MAX(total)
                FROM (
                    SELECT SUM(mmpd2.SoLuong) AS total
                    FROM phieu_dat pd2
                    JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
                    WHERE pd2.MaCN = pd.MaCN
                    ${startDate && endDate ? "AND pd2.NgayDat BETWEEN @StartDate AND @EndDate" : ""}
                    GROUP BY mmpd2.MaMon
                ) AS totals
            )
        `;

        const request = pool.request();
        request.input('StartDate', sql.Date, startDate);
        request.input('EndDate', sql.Date, endDate);

        if (branchId) {
            request.input('BranchId', sql.Int, branchId);
        }

        const result = await request.query(query);

        const branches = await pool.request().query(`SELECT MaCN, TenCN FROM chi_nhanh`);

        res.render('admin/pages/mostSoldDishes', {
            title: 'Most Sold Dish - By Branch and Date Range',
            layout: 'admin_layouts/mainAdmin',
            dishes: result.recordset,
            branches: branches.recordset,
            startDate,
            endDate,
            selectedBranch: branchId,
            filter: 'branch-date',
        });
    } catch (error) {
        console.error('Error fetching most sold dish by branch and date:', error);
        res.status(500).send('Error fetching data');
    }
};

