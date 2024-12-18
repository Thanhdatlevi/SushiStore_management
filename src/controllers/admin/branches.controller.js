
const sql = require('mssql');
const { sqlConfig, poolPromise } = require("../../config/database");

module.exports = {
  getAllBranches: async (req, res) => {
    try {
      const pool = await poolPromise;

      const result = await pool.request().query(`
              SELECT MaCN, TenCN, DiaChi, GioMo, GioDong, SDT, GiaoHang, XeMay, XeHoi, NVQuanLy, MaKhuVuc
              FROM chi_nhanh
              where DangHoatDong = 1
          `);

      res.render('admin/pages/branches', {
        layout: 'admin_layouts/mainAdmin',
        title: 'Branch Management',
        branches: result.recordset
      });
    } catch (error) {
      console.error('Error fetching branches:', error);
      res.status(500).send('Error fetching branches');
    }

  },

  // 2. Hiển thị form thêm chi nhánh
  showAddBranchForm: async (req, res) => {
    try {
      const pool = await poolPromise;

      const regions = await pool.request().query(`SELECT MaKhuVuc, TenKhuVuc FROM khu_vuc`);

      res.render('admin/pages/addBranches', {
        layout: 'admin_layouts/mainAdmin',
        title: 'Add Branch',
        regions: regions.recordset
      });
    } catch (error) {
      console.error('Error loading add branch form:', error);
      res.status(500).send('Error loading form');
    }
  },



  // 3. Thêm chi nhánh mới
  addBranch: async (req, res) => {
    const { TenCN, DiaChi, GioMo, GioDong, SDT, GiaoHang, XeMay, XeHoi, MaKhuVuc } = req.body;
  
    // Hàm đảm bảo thời gian ở định dạng HH:MM:SS
    const formatTime = (time) => {
      if (!time) return null; // Xử lý nếu thời gian không hợp lệ
      return time.length === 5 ? `${time}:00` : time; // Thêm :00 nếu thiếu giây
    };
  
    try {
      const pool = await poolPromise;
  
      // Xử lý thời gian
      const formattedGioMo = formatTime(GioMo);
      const formattedGioDong = formatTime(GioDong);
  
      console.log("Formatted Open Time:", formattedGioMo);
      console.log("Formatted Close Time:", formattedGioDong);
  
      await pool.request()
        .input('TenCN', sql.NVarChar(50), TenCN)
        .input('DiaChi', sql.NVarChar(100), DiaChi)
        .input('GioMo', sql.Time, formattedGioMo)
        .input('GioDong', sql.Time, formattedGioDong)
        .input('SDT', sql.NVarChar(15), SDT)
        .input('GiaoHang', sql.Bit, GiaoHang)
        .input('XeMay', sql.Bit, XeMay)
        .input('XeHoi', sql.Bit, XeHoi)
        .input('MaKhuVuc', sql.Int, MaKhuVuc)
        .query(`
          INSERT INTO chi_nhanh (TenCN, DiaChi, GioMo, GioDong, SDT, GiaoHang, XeMay, XeHoi, MaKhuVuc)
          VALUES (@TenCN, @DiaChi, @GioMo, @GioDong, @SDT, @GiaoHang, @XeMay, @XeHoi, @MaKhuVuc)
        `);
  
      res.redirect('/admin/branches');
    } catch (error) {
      console.error('Error adding branch:', error);
      res.status(500).send('Error adding branch');
    }
  },  

  

  // 4. Hiển thị form sửa chi nhánh
  showEditBranchForm: async (req, res) => {
    const { id } = req.params;

    try {
      const pool = await poolPromise;

      const branchResult = await pool.request()
        .input('MaCN', sql.Int, id)
        .query(`SELECT * FROM chi_nhanh WHERE MaCN = @MaCN`);

      const regions = await pool.request().query(`SELECT MaKhuVuc, TenKhuVuc FROM khu_vuc`);

      if (branchResult.recordset.length === 0) {
        return res.status(404).send('Branch not found');
      }

      res.render('admin/pages/editBranch', {
        layout: 'admin_layouts/mainAdmin',
        title: 'Edit Branch',
        branch: branchResult.recordset[0],
        regions: regions.recordset
      });
    } catch (error) {
      console.error('Error fetching branch:', error);
      res.status(500).send('Error fetching branch');
    }
  },

  // 5. Sửa chi nhánh
  editBranch: async (req, res) => {
    const { id } = req.params;
    const { TenCN, DiaChi, GioMo, GioDong, SDT, GiaoHang, XeMay, XeHoi, MaKhuVuc } = req.body;

    try {
      const pool = await poolPromise;

      await pool.request()
        .input('MaCN', sql.Int, id)
        .input('TenCN', sql.NVarChar(50), TenCN)
        .input('DiaChi', sql.NVarChar(100), DiaChi)
        .input('GioMo', sql.Time, GioMo)
        .input('GioDong', sql.Time, GioDong)
        .input('SDT', sql.NVarChar(15), SDT)
        .input('GiaoHang', sql.Bit, GiaoHang)
        .input('XeMay', sql.Bit, XeMay)
        .input('XeHoi', sql.Bit, XeHoi)
        .input('MaKhuVuc', sql.Int, MaKhuVuc)
        .query(`
                    UPDATE chi_nhanh
                    SET TenCN = @TenCN, DiaChi = @DiaChi, GioMo = @GioMo, GioDong = @GioDong, SDT = @SDT,
                        GiaoHang = @GiaoHang, XeMay = @XeMay, XeHoi = @XeHoi, MaKhuVuc = @MaKhuVuc
                    WHERE MaCN = @MaCN
                `);

      res.redirect('/admin/branches');
    } catch (error) {
      console.error('Error updating branch:', error);
      res.status(500).send('Error updating branch');
    }
  },

  // 6. Xóa chi nhánh (ẩn đi - cập nhật DangHoatDong)
  deleteBranch: async (req, res) => {
    const { id } = req.params;

    try {
      const pool = await poolPromise;

      await pool.request()
        .input('MaCN', sql.Int, id)
        .query(`UPDATE chi_nhanh SET DangHoatDong = 0 WHERE MaCN = @MaCN`);

      res.redirect('/admin/branches');
    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).send('Error deleting branch');
    }
  }
};



