const sql = require('mssql');
const { sqlConfig, poolPromise } = require("../../config/database");

module.exports.getAllEmployees = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { MaChiNhanh } = req.query;

        let result;

        if (MaChiNhanh) {
            result = await pool.request()
                .input('MaChiNhanh', sql.Int, MaChiNhanh)
                .query(`
                    SELECT nv.MaNV, nv.HoTen, nv.SoNha, nv.Duong, nv.Quan, nv.ThanhPho, nv.NgaySinh, 
                           nv.Phai, bp.TenBoPhan AS BoPhan, nv.ChiNhanh, nv.Luong
                    FROM nhan_vien nv
                    JOIN bo_phan bp ON nv.BoPhan = bp.MaBoPhan
                    WHERE nv.ChiNhanh = @MaChiNhanh AND nv.DangLamViec = 1
                    ORDER BY nv.HoTen ASC
                `);
        } else {
            result = await pool.request().query(`
                SELECT nv.MaNV, nv.HoTen, nv.SoNha, nv.Duong, nv.Quan, nv.ThanhPho, nv.NgaySinh, 
                       nv.Phai, bp.TenBoPhan AS BoPhan, nv.ChiNhanh, nv.Luong
                FROM nhan_vien nv
                JOIN bo_phan bp ON nv.BoPhan = bp.MaBoPhan
                WHERE nv.DangLamViec = 1
                ORDER BY nv.ChiNhanh ASC
            `);
        }

        const branches = await pool.request().query(`
            SELECT MaCN, TenCN
            FROM chi_nhanh
        `);

        res.render('admin/pages/employees', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Employee Management',
            employees: result.recordset,
            branches: branches.recordset,
            MaChiNhanh
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching employees');
    }
};





// Cập nhật controller để render form thêm nhân viên
module.exports.showAddEmployeeForm = async (req, res) => {
    try {
        const pool = await sql.connect(sqlConfig);

        const departmentsResult = await pool.request().query('SELECT * FROM bo_phan');
        const departments = departmentsResult.recordset;

        const branchesResult = await pool.request().query('SELECT * FROM chi_nhanh');
        const branches = branchesResult.recordset;

        res.render('admin/pages/addEmployee', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Thêm Nhân Viên',
            departments: departments,
            branches: branches
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading employee form');
    }
};


module.exports.addEmployee = async (req, res) => {
    const { MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, NgaySinh, Phai, BoPhan, ChiNhanh } = req.body;

    if (!MaNV || !HoTen || !SoNha || !Duong || !Quan || !ThanhPho || !NgaySinh || !Phai || !BoPhan || !ChiNhanh) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const pool = await sql.connect(sqlConfig);


        await pool.request()
            .input('MaNV', sql.NVarChar, MaNV)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('SoNha', sql.NVarChar, SoNha)
            .input('Duong', sql.NVarChar, Duong)
            .input('Quan', sql.NVarChar, Quan)
            .input('ThanhPho', sql.NVarChar, ThanhPho)
            .input('NgaySinh', sql.Date, NgaySinh)
            .input('Phai', sql.NVarChar, Phai)
            .input('BoPhan', sql.Int, BoPhan)
            .input('ChiNhanh', sql.Int, ChiNhanh)
            .query(`
                INSERT INTO nhan_vien (MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, NgaySinh, Phai, BoPhan, ChiNhanh)
                VALUES (@MaNV, @HoTen, @SoNha, @Duong, @Quan, @ThanhPho, @NgaySinh, @Phai, @BoPhan, @ChiNhanh)
            `);

        res.redirect('/admin/employees');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding employee');
    }
};




// Lấy thông tin nhân viên để sửa
module.exports.getEmployeeById = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNV', sql.NVarChar, id)
            .query(`SELECT * FROM nhan_vien WHERE MaNV = @MaNV`);

        if (result.recordset.length === 0) {
            return res.status(404).send('Employee not found');
        }
        //--
        const departmentsResult = await pool.request().query('SELECT * FROM bo_phan');
        const departments = departmentsResult.recordset;

        const branchesResult = await pool.request().query('SELECT * FROM chi_nhanh');
        const branches = branchesResult.recordset;

        res.render('admin/pages/editEmployee', {
            employee: result.recordset[0],
            layout: 'admin_layouts/mainAdmin',
            title: 'Edit Employee',
            departments: departments,
            branches: branches,
            // employee: employee,
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).send('Error fetching employee');
    }
};


// cập nhật nhân viên ver cũ (chưa có cập nhật Lương)

// module.exports.editEmployee = async (req, res) => {
//     const { id } = req.params;
//     // const { MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, NgaySinh, Phai, BoPhan, ChiNhanh } = req.body;
//     const { MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, Phai, BoPhan, ChiNhanh } = req.body;

//     // Kiểm tra dữ liệu đầu vào
//     if (!MaNV || !HoTen || !SoNha || !Duong || !Quan || !ThanhPho || !Phai || !BoPhan || !ChiNhanh) {
//         return res.render('editEmployee', {
//             errorMessage: 'All fields are required.',
//             employee: req.body  // Render lại dữ liệu đã nhập
//         });
//     }

//     try {
//         const pool = await sql.connect(sqlConfig);
//         await pool.request()
//             .input('MaNV', sql.NVarChar, MaNV)
//             .input('HoTen', sql.NVarChar, HoTen)
//             .input('SoNha', sql.NVarChar, SoNha)
//             .input('Duong', sql.NVarChar, Duong)
//             .input('Quan', sql.NVarChar, Quan)
//             .input('ThanhPho', sql.NVarChar, ThanhPho)
//             // .input('NgaySinh', sql.Date, NgaySinh)
//             .input('Phai', sql.NVarChar, Phai)
//             .input('BoPhan', sql.Int, BoPhan)
//             .input('ChiNhanh', sql.Int, ChiNhanh)
//             // .input('MucLuong', sql.Float, MucLuong)
//             .query(`
//                 -- UPDATE nhan_vien 
//                 -- SET HoTen = @HoTen, SoNha = @SoNha, Duong = @Duong, Quan = @Quan, ThanhPho = @ThanhPho, 
//                 --     NgaySinh = @NgaySinh, Phai = @Phai, BoPhan = @BoPhan, ChiNhanh = @ChiNhanh
//                 -- WHERE MaNV = @MaNV
//                 UPDATE nhan_vien 
//                 SET HoTen = @HoTen, SoNha = @SoNha, Duong = @Duong, Quan = @Quan, ThanhPho = @ThanhPho
//                     , Phai = @Phai, BoPhan = @BoPhan, ChiNhanh = @ChiNhanh
//                 WHERE MaNV = @MaNV
//             `);

//         res.redirect('/admin/employees');
//     } catch (error) {
//         console.error('Error updating employee:', error);
//         res.status(500).send('Error updating employee');
//     }
// };



// module.exports.editEmployee = async (req, res) => {
//     const { id } = req.params;
//      const { MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, Phai, BoPhan, ChiNhanh, MucLuong } = req.body;

//     // Kiểm tra dữ liệu đầu vào
//     if (!MaNV || !HoTen || !SoNha || !Duong || !Quan || !ThanhPho || !Phai || !BoPhan || !ChiNhanh || !MucLuong) {
//         return res.render('editEmployee', {
//             errorMessage: 'All fields are required.',
//             employee: req.body  // Render lại dữ liệu đã nhập

//         });
//     }

//     try {
//         const pool = await sql.connect(sqlConfig);

//         // Cập nhật thông tin nhân viên, bao gồm cả lương
//         await pool.request()
//             .input('MaNV', sql.NVarChar, MaNV)
//             .input('HoTen', sql.NVarChar, HoTen)
//             .input('SoNha', sql.NVarChar, SoNha)
//             .input('Duong', sql.NVarChar, Duong)
//             .input('Quan', sql.NVarChar, Quan)
//             .input('ThanhPho', sql.NVarChar, ThanhPho)
//             .input('Phai', sql.NVarChar, Phai)
//             .input('BoPhan', sql.Int, BoPhan)
//             .input('ChiNhanh', sql.Int, ChiNhanh)
//             .input('MucLuong', sql.Float, MucLuong)  // Nhập lương mới
//             .query(`
//                 UPDATE nhan_vien
//                 SET 
//                     HoTen = @HoTen,
//                     SoNha = @SoNha,
//                     Duong = @Duong,
//                     Quan = @Quan,
//                     ThanhPho = @ThanhPho,
//                     Phai = @Phai,
//                     BoPhan = @BoPhan,
//                     ChiNhanh = @ChiNhanh
//                 WHERE MaNV = @MaNV
//             `);

//         // Cập nhật lương trong bảng bo_phan (nếu cần)
//         await pool.request()
//             .input('MucLuong', sql.Float, MucLuong)
//             .input('BoPhan', sql.Int, BoPhan)
//             .query(`
//                 UPDATE bo_phan
//                 SET MucLuong = @MucLuong
//                 WHERE MaBoPhan = @BoPhan
//             `);

//         // Sau khi cập nhật thành công, quay lại trang danh sách nhân viên
//         res.redirect('/admin/employees');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error updating employee');
//     }
// };


// module.exports.editEmployee = async (req, res) => {
//     const { id } = req.params;  // Lấy mã nhân viên từ URL
//     const { MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, Phai, BoPhan, ChiNhanh, Luong } = req.body;

//     // Kiểm tra dữ liệu đầu vào
//     if (!MaNV || !HoTen || !SoNha || !Duong || !Quan || !ThanhPho || !Phai || !BoPhan || !ChiNhanh || !Luong) {
//         return res.render('editEmployee', {
//             errorMessage: 'All fields are required.',
//             employee: req.body  // Render lại dữ liệu đã nhập
//         });
//     }

//     try {
//         const pool = await sql.connect(sqlConfig);

//         // Truy vấn để lấy mức lương của bộ phận hiện tại
//         const result = await pool.request()
//             .input('MaNV', sql.NVarChar, MaNV)
//             .query(`
//                 SELECT nv.MaNV, nv.HoTen, nv.SoNha, nv.Duong, nv.Quan, nv.ThanhPho, nv.Phai, nv.BoPhan, nv.ChiNhanh, bp.MucLuong
//                 FROM nhan_vien nv
//                 JOIN bo_phan bp O N nv.BoPhan = bp.MaBoPhan
//                 WHERE nv.MaNV = @MaNV
//             `);

//         const employee = result.recordset[0];  // Lấy dữ liệu nhân viên
//         if (!employee) {
//             return res.status(404).send('Employee not found');
//         }

//         // Cập nhật thông tin nhân viên, bao gồm cả mức lương
//         await pool.request()
//             .input('MaNV', sql.NVarChar, MaNV)
//             .input('HoTen', sql.NVarChar, HoTen)
//             .input('SoNha', sql.NVarChar, SoNha)
//             .input('Duong', sql.NVarChar, Duong)
//             .input('Quan', sql.NVarChar, Quan)
//             .input('ThanhPho', sql.NVarChar, ThanhPho)
//             .input('Phai', sql.NVarChar, Phai)
//             .input('BoPhan', sql.Int, BoPhan)  // Mã bộ phận
//             .input('ChiNhanh', sql.NVarChar, ChiNhanh)
//             .input('Luong', sql.Float, Luong)  // Mức lương mới
//             .query(`
//                 UPDATE nhan_vien
//                 SET HoTen = @HoTen, SoNha = @SoNha, Duong = @Duong, Quan = @Quan,
//                     ThanhPho = @ThanhPho, Phai = @Phai, BoPhan = @BoPhan, ChiNhanh = @ChiNhanh, Luong = @Luong
//                 WHERE MaNV = @MaNV
//             `);

//         res.redirect('/admin/employees');  // Sau khi cập nhật xong, chuyển hướng về danh sách nhân viên

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error updating employee');
//     }
// };



// module.exports.editEmployee = async (req, res) => {
//     const { id } = req.params; // Lấy mã nhân viên từ URL
//     const { MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, Phai, BoPhan, ChiNhanh, Luong } = req.body;

//     // Kiểm tra dữ liệu đầu vào
//     if (!MaNV || !HoTen || !SoNha || !Duong || !Quan || !ThanhPho || !Phai || !BoPhan || !ChiNhanh || !Luong) {
//         return res.render('editEmployee', {
//             errorMessage: 'All fields are required.',
//             employee: req.body // Render lại dữ liệu đã nhập
//         });
//     }

//     try {
//         const pool = await sql.connect(sqlConfig);

//         // Lấy thông tin nhân viên hiện tại
//         const result = await pool.request()
//             .input('MaNV', sql.Char(5), MaNV)
//             .query(`
//                 SELECT ChiNhanh, BoPhan
//                 FROM nhan_vien
//                 WHERE MaNV = @MaNV
//             `);

//         const currentEmployee = result.recordset[0]; // Lấy dữ liệu nhân viên hiện tại
//         if (!currentEmployee) {
//             return res.status(404).send('Employee not found');
//         }

//         const currentChiNhanh = currentEmployee.ChiNhanh;
//         const currentBoPhan = currentEmployee.BoPhan;

//         // Nếu chi nhánh thay đổi, gọi procedure ChuyenNhanSu
//         if (currentChiNhanh !== parseInt(ChiNhanh)) {
//             await pool.request()
//                 .input('MaNV', sql.Char(5), MaNV)
//                 .input('MaChiNhanhMoi', sql.Int, ChiNhanh)
//                 .input('MaBoPhanMoi', sql.Int, BoPhan) // Có thể null
//                 .execute('ChuyenNhanSu');
//         }

//         // Cập nhật thông tin nhân viên (ngoại trừ chi nhánh và bộ phận nếu đã xử lý qua procedure)
//         await pool.request()
//             .input('MaNV', sql.Char(5), MaNV)
//             .input('HoTen', sql.NVarChar, HoTen)
//             .input('SoNha', sql.NVarChar, SoNha)
//             .input('Duong', sql.NVarChar, Duong)
//             .input('Quan', sql.NVarChar, Quan)
//             .input('ThanhPho', sql.NVarChar, ThanhPho)
//             .input('Phai', sql.NVarChar, Phai)
//             .input('Luong', sql.Float, Luong)
//             .input('BoPhan', sql.Int, BoPhan) 
//             .query(`
//                 UPDATE nhan_vien
//                 SET HoTen = @HoTen, SoNha = @SoNha, Duong = @Duong, Quan = @Quan,
//                     ThanhPho = @ThanhPho, Phai = @Phai, Luong = @Luong
//                 WHERE MaNV = @MaNV
//             `);

//         res.redirect('/admin/employees'); 
//     } catch (error) {
//         console.error('Error updating employee:', error);
//         res.status(500).send('Error updating employee');
//     }
// };

module.exports.editEmployee = async (req, res) => {
    const { id } = req.params;
    const { MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, Phai, BoPhan, ChiNhanh, Luong } = req.body;

    if (!MaNV || !HoTen || !SoNha || !Duong || !Quan || !ThanhPho || !Phai || !BoPhan || !ChiNhanh || !Luong) {
        return res.render('editEmployee', {
            errorMessage: 'All fields are required.',
            employee: req.body
        });
    }

    try {
        const pool = await sql.connect(sqlConfig);

        const result = await pool.request()
            .input('MaNV', sql.Char(5), MaNV)
            .query(`
                SELECT ChiNhanh, BoPhan
                FROM nhan_vien
                WHERE MaNV = @MaNV
            `);

        const currentEmployee = result.recordset[0];
        if (!currentEmployee) {
            return res.status(404).send('Employee not found');
        }

        const currentChiNhanh = currentEmployee.ChiNhanh;
        const currentBoPhan = currentEmployee.BoPhan;

        if (currentChiNhanh !== parseInt(ChiNhanh) || currentBoPhan !== parseInt(BoPhan)) {
            await pool.request()
                .input('MaNV', sql.Char(5), MaNV)
                .input('MaChiNhanhMoi', sql.Int, ChiNhanh)
                .input('MaBoPhanMoi', sql.Int, BoPhan)
                .execute('ChuyenNhanSu');
        }

        await pool.request()
            .input('MaNV', sql.Char(5), MaNV)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('SoNha', sql.NVarChar, SoNha)
            .input('Duong', sql.NVarChar, Duong)
            .input('Quan', sql.NVarChar, Quan)
            .input('ThanhPho', sql.NVarChar, ThanhPho)
            .input('Phai', sql.NVarChar, Phai)
            .input('Luong', sql.Float, Luong)
            .input('BoPhan', sql.Int, BoPhan)
            .query(`
                UPDATE nhan_vien
                SET HoTen = @HoTen, SoNha = @SoNha, Duong = @Duong, Quan = @Quan,
                    ThanhPho = @ThanhPho, Phai = @Phai, Luong = @Luong, BoPhan = @BoPhan
                WHERE MaNV = @MaNV
            `);

        res.redirect('/admin/employees');
    } catch (error) {
        console.error('Error updating employee:', error);
        // res.status(500).send('Error updating employee');
        res.redirect('/admin/employees');
    }
};








// // Xóa nhân viên
module.exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Request Params:', req.params);


        if (!id) {
            return res.status(400).send('Employee ID is required');
        }

        const pool = await poolPromise;

        await pool.request()
            .input('MaNV', sql.Char(5), id)
            .execute('xoa_nhan_vien');

        res.redirect('/admin/employees');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('Error deleting employee');
    }
};


// tìm kiếm nhân viên
module.exports.searchEmployee = async (req, res) => {
    const { searchTerm } = req.query;

    try {
        const pool = await sql.connect(sqlConfig);

        const result = await pool.request()
            .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
            .query(`
                SELECT 
                    MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, NgaySinh, Phai, BoPhan, ChiNhanh, Luong
                FROM 
                    nhan_vien nv
                JOIN 
                    bo_phan bp 
                ON 
                    bp.MaBoPhan = nv.BoPhan
                WHERE 
                    (MaNV LIKE @searchTerm OR HoTen LIKE @searchTerm)
                    AND DangLamViec = 1 -- Chỉ lấy nhân viên đang làm việc
                ORDER BY 
                    ChiNhanh ASC
            `);

        res.render('admin/pages/employees', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Employee Management',
            employees: result.recordset,
            searchTerm: searchTerm
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error searching employees');
    }
};




