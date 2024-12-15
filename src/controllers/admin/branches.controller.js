const sql = require('mssql');
const { sqlConfig, poolPromise } = require("../../config/database");

module.exports.getAllBranches = async (req, res) => {
  try {

    const poll = await poolPromise;
    const result = await poll.query('SELECT * FROM chi_nhanh');
    // console.log(result.recordset);
    res.render('admin/pages/branches', {
      layout: 'admin_layouts/mainAdmin',
      title: 'Branches',
      scripts: '<script src="/js/home.js"></script>',
      branches: result.recordset
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching branches');
  }
};

// Hàm formatTime để đảm bảo thời gian là định dạng HH:mm:ss
const formatTime = (time) => {
  if (!time) return null; // Nếu thời gian không có giá trị, trả về null

  // Kiểm tra nếu thời gian có định dạng HH:mm thì thêm phần giây ":00"
  if (time.length === 5) {
    return `${time}:00`; // Định dạng HH:mm -> HH:mm:ss
  }

  // Nếu đã có định dạng HH:mm:ss thì không cần thay đổi
  return time;
};

module.exports.addBranch = async (req, res) => {
  try {
    const { tenChiNhanh, diaChi, gioMo, gioDong, sdt, giaoHang, xeMay, xeHoi, maKhuVuc, nvQuanLy } = req.body;

    const formattedGioMo = formatTime(gioMo);  // Đảm bảo định dạng HH:mm:ss
    const formattedGioDong = formatTime(gioDong);

    // Kết nối đến cơ sở dữ liệu MSSQL
    let pool = await sql.connect(sqlConfig);

    // Chạy câu lệnh INSERT vào bảng chi_nhanh
    const result = await pool.request()
      .input('TenCN', sql.NVarChar, tenChiNhanh)
      .input('DiaChi', sql.NVarChar, diaChi)
      .input('GioMo', sql.Time, formattedGioMo)
      .input('GioDong', sql.Time, formattedGioDong)
      .input('SDT', sql.NVarChar, sdt)
      .input('GiaoHang', sql.Bit, giaoHang)
      .input('XeMay', sql.Bit, xeMay)
      .input('XeHoi', sql.Bit, xeHoi)
      .input('NVQuanLy', sql.Char(5), nvQuanLy)
      .input('MaKhuVuc', sql.Int, maKhuVuc)
      .query(`
            INSERT INTO chi_nhanh 
                (TenCN, DiaChi, GioMo, GioDong, SDT, GiaoHang, XeMay, XeHoi, NVQuanLy, MaKhuVuc)
            VALUES 
                (@TenCN, @DiaChi, @GioMo, @GioDong, @SDT, @GiaoHang, @XeMay, @XeHoi, @NVQuanLy, @MaKhuVuc)
        `);

    // Nếu thêm thành công, chuyển hướng về danh sách chi nhánh
    res.redirect('/admin/branches');
  } catch (err) {
    // In chi tiết lỗi ra console
    console.error("Lỗi khi thêm chi nhánh:", err);

    // Trả về thông báo lỗi cho người dùng
    res.status(500).send(`Có lỗi xảy ra khi thêm chi nhánh: ${err.message}`);
  }
}


// --------------------------------------------------------------------
// Xoá chi nhánh
module.exports.deleteBranch = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    console.log(`Attempting to delete branch with MaCN: ${id}`);

    // Kiểm tra tồn tại chi nhánh với MaCN
    const checkResult = await pool.query(`SELECT * FROM chi_nhanh WHERE MaCN = '${id}'`);
    if (checkResult.recordset.length === 0) {
      console.log(`Branch with MaCN ${id} not found.`);
      return res.status(404).send('Chi nhánh không tồn tại.');
    }

    // Cập nhật lịch sử làm việc để không còn liên kết với nhân viên tại chi nhánh này
    await pool.query(`UPDATE lich_su_lam_viec SET MaNV = NULL WHERE MaNV IN (SELECT MaNV FROM nhan_vien WHERE ChiNhanh = '${id}')`);

    // Xóa nhân viên liên quan đến chi nhánh
    await pool.query(`UPDATE nhan_vien SET ChiNhanh = NULL WHERE ChiNhanh = '${id}'`);

    // Sau đó, xóa chi nhánh
    const result = await pool.query(`DELETE FROM chi_nhanh WHERE MaCN = '${id}'`);

    console.log(`Branch with MaCN ${id} deleted successfully.`);

    res.redirect('/admin/branches'); // Quay lại trang danh sách chi nhánh
  } catch (error) {
    console.error('Error occurred:', error); // Ghi chi tiết lỗi
    res.status(500).send('Error deleting branch');
  }
};



// ----------------------------------------------------
// sửa chi nhánh

// Sửa chi nhánh
module.exports.getBranchById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.query(`SELECT * FROM chi_nhanh WHERE MaCN = '${id}'`);
    res.render('admin/pages/editBranch', {
      branch: result.recordset[0], layout: 'admin_layouts/mainAdmin',
      title: 'Branches',
      scripts: '<script src="/js/home.js"></script>'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching branch');
  }
};


const formatTime2 = (time) => {
  // Kiểm tra nếu có 'AM' hoặc 'PM' trong thời gian
  if (time.includes('AM') || time.includes('PM')) {
    return convertTo24HourFormat(time); // Dùng hàm convertTo24HourFormat để chuyển sang 24 giờ
  }

  const [hours, minutes] = time.split(':');
  if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
    return `${hours}:${minutes}:00`; // Thêm phần giây
  }
  return null; // Nếu không hợp lệ
};


module.exports.editBranch = async (req, res) => {
  const { id } = req.params;
  const { TenCN, DiaChi, GioMo, GioDong, SDT, GiaoHang, XeMay, XeHoi, NVQuanLy, MaKhuVuc } = req.body;

  // Định dạng lại thời gian trước khi gửi vào SQL
  const GioMoFormatted = formatTime2(GioMo); 
  const GioDongFormatted = formatTime2(GioDong);

  console.log(GioMo);
  console.log(GioMoFormatted);

  // Kiểm tra tính hợp lệ của thời gian
  if (!GioMoFormatted || !GioDongFormatted) {
    return res.status(400).send('Invalid time format');
  }

  try {
    const pool = await poolPromise;
    // Cập nhật chi nhánh với cú pháp chuẩn
    const result = await pool.request()
      .input('TenCN', sql.NVarChar, TenCN)
      .input('DiaChi', sql.NVarChar, DiaChi)
      .input('GioMo', sql.Time, GioMoFormatted)  
      .input('GioDong', sql.Time, GioDongFormatted)  
      .input('SDT', sql.NVarChar, SDT)
      .input('GiaoHang', sql.Bit, GiaoHang)
      .input('XeMay', sql.Bit, XeMay)
      .input('XeHoi', sql.Bit, XeHoi)
      .input('NVQuanLy', sql.Char(5), NVQuanLy)
      .input('MaKhuVuc', sql.Int, MaKhuVuc)
      .input('MaCN', sql.Int, id) // Thêm tham số MaCN để xác định chi nhánh cần sửa
      .query(`
        UPDATE chi_nhanh
        SET TenCN = @TenCN, 
            DiaChi = @DiaChi, 
            GioMo = @GioMo, 
            GioDong = @GioDong, 
            SDT = @SDT, 
            GiaoHang = @GiaoHang, 
            XeMay = @XeMay, 
            XeHoi = @XeHoi, 
            NVQuanLy = @NVQuanLy, 
            MaKhuVuc = @MaKhuVuc
        WHERE MaCN = @MaCN
      `);

    res.redirect('/admin/branches');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating branch');
  }
};






