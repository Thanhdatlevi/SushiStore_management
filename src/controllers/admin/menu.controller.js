const sql = require('mssql');
const { poolPromise } = require('../../config/database');

module.exports.getMenuPage = async (req, res) => {
    try {
        const pool = await poolPromise;

        const regionsResult = await pool.query('SELECT MaKhuVuc, TenKhuVuc FROM khu_vuc');
        const regions = regionsResult.recordset;

        const branchesResult = await pool.query('SELECT MaCN, TenCN FROM chi_nhanh');
        const branches = branchesResult.recordset;

        const { regionId, branchId } = req.query;
        let dishesQuery = `
            SELECT ma.MaMon, ma.TenMon, ma.Gia, ma.Loai
            FROM mon_an ma
        `;

        if (regionId) {
            dishesQuery += `
                INNER JOIN mon_an_khu_vuc makv ON ma.MaMon = makv.MaMon
                WHERE makv.MaKhuVuc = @regionId
            `;
        }

        if (branchId) {
            dishesQuery += `
                INNER JOIN mon_an_chi_nhanh macn ON ma.MaMon = macn.MaMon
                WHERE macn.MaCN = @branchId
            `;
        }

        const dishesResult = await pool.request()
            .input('regionId', sql.Int, regionId || null)
            .input('branchId', sql.Int, branchId || null)
            .query(dishesQuery);

        res.render('admin/pages/menu', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Menu Management',
            regions,
            branches,
            dishes: dishesResult.recordset,
            regionId,
            branchId,
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).send('Error fetching menu');
    }
};

// làm lại thêm món ăn

// module.exports.renderAddDishForm = async (req, res) => {
//     try {
//         const pool = await poolPromise;

//         // Lấy danh sách khu vực và món ăn
//         const [regions, dishes] = await Promise.all([
//             pool.request().query("SELECT MaKhuVuc, TenKhuVuc FROM khu_vuc"),
//             pool.request().query("SELECT MaMon, TenMon FROM mon_an"),
//         ]);

//         res.render("admin/pages/addDish", {
//             layout: "admin_layouts/mainAdmin",
//             title: "Add Dish to Branch",
//             regions: regions.recordset,
//             dishes: dishes.recordset,
//             branches: [], // Mặc định không có chi nhánh khi trang mới load
//         });
//     } catch (err) {
//         console.error("Error rendering add dish form:", err);
//         res.status(500).send("Error rendering form");
//     }
// };

module.exports.renderAddDishForm = async (req, res) => {
    try {
        const pool = await poolPromise;

        const regions = await pool.request().query(`SELECT MaKhuVuc, TenKhuVuc FROM khu_vuc`);

        res.render("admin/pages/addDish", {
            layout: "admin_layouts/mainAdmin",
            title: "Add New Dish",
            regions: regions.recordset, 
        });
    } catch (error) {
        console.error("Error fetching regions:", error);
        res.status(500).send("Error fetching regions");
    }
};



// module.exports.getBranchesByRegion = async (req, res) => {
//     const { MaKhuVuc } = req.query;

//     try {
//         const pool = await poolPromise;

//         const result = await pool
//             .request()
//             .input("MaKhuVuc", sql.Int, MaKhuVuc)
//             .query("SELECT MaCN, TenCN FROM chi_nhanh WHERE MaKhuVuc = @MaKhuVuc");

//         res.json(result.recordset); // Trả về JSON cho client
//     } catch (err) {
//         console.error("Error fetching branches by region:", err);
//         res.status(500).json({ error: "Error fetching branches" });
//     }
// };

module.exports.getBranchesByRegion = async (req, res) => {
    const { MaKhuVuc } = req.query;

    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("MaKhuVuc", sql.Int, MaKhuVuc)
            .query("SELECT MaCN, TenCN FROM chi_nhanh WHERE MaKhuVuc = @MaKhuVuc");

        res.json(result.recordset); 
    } catch (err) {
        console.error("Error fetching branches by region:", err);
        res.status(500).json({ error: "Error fetching branches" });
    }
};


//   module.exports.addDishToBranch = async (req, res) => {
//     try {
//       const { MaCN, MaMon, GiaoHang } = req.body;

//       const pool = await poolPromise;

//       await pool
//         .request()
//         .input("MaCN", sql.Int, MaCN)
//         .input("MaMon", sql.Char(5), MaMon)
//         .input("GiaoHang", sql.Bit, GiaoHang)
//         .query(
//           `INSERT INTO mon_an_chi_nhanh (MaCN, MaMon, GiaoHang)
//            VALUES (@MaCN, @MaMon, @GiaoHang)`
//         );

//       res.redirect("/admin/menu");
//     } catch (err) {
//       console.error("Error adding dish to branch:", err);
//       res.status(500).send("Error adding dish");
//     }
//   };

module.exports.addDishToBranch = async (req, res) => {
    const { MaMon, TenMon, Gia, Loai, MaKhuVuc, MaCN, GiaoHang } = req.body;

    try {
        const pool = await poolPromise;

        const dishResult = await pool.request()
            .input("MaMon", sql.Char(5), MaMon)
            .query("SELECT 1 FROM mon_an WHERE MaMon = @MaMon");

        if (dishResult.recordset.length === 0) {
            await pool.request()
                .input("MaMon", sql.Char(5), MaMon)
                .input("TenMon", sql.NVarChar(50), TenMon)
                .input("Gia", sql.Int, Gia)
                .input("Loai", sql.NVarChar(50), Loai)
                .query(`
                    INSERT INTO mon_an (MaMon, TenMon, Gia, Loai)
                    VALUES (@MaMon, @TenMon, @Gia, @Loai)
                `);
        }

        const regionResult = await pool.request()
            .input("MaKhuVuc", sql.Int, MaKhuVuc)
            .input("MaMon", sql.Char(5), MaMon)
            .query(`
                SELECT 1 FROM mon_an_khu_vuc 
                WHERE MaKhuVuc = @MaKhuVuc AND MaMon = @MaMon
            `);

        if (regionResult.recordset.length === 0) {
            // Thêm món ăn vào khu vực
            await pool.request()
                .input("MaKhuVuc", sql.Int, MaKhuVuc)
                .input("MaMon", sql.Char(5), MaMon)
                .query(`
                    INSERT INTO mon_an_khu_vuc (MaKhuVuc, MaMon)
                    VALUES (@MaKhuVuc, @MaMon)
                `);
        }

        //  Thêm món ăn vào chi nhánh
        await pool.request()
            .input("MaCN", sql.Int, MaCN)
            .input("MaMon", sql.Char(5), MaMon)
            .input("GiaoHang", sql.Bit, GiaoHang)
            .query(`
                INSERT INTO mon_an_chi_nhanh (MaCN, MaMon, GiaoHang)
                VALUES (@MaCN, @MaMon, @GiaoHang)
            `);

        res.redirect("/admin/menu"); 
    } catch (error) {
        console.error("Error adding dish to branch:", error);
        res.status(500).send("Error adding dish to branch");
    }
};



//----------------------------------------------------------------------------------------

// module.exports.renderAddDishForm = async(req, res)=>{
//     res.render('admin/pages/addDish', {
//         layout: 'admin_layouts/mainAdmin',
//         title: 'Menu Management',
//     });
// }

// // // Thêm món ăn
// // module.exports.addDish = async (req, res) => {
// //     const { MaMon, TenMon, Gia, Loai } = req.body;

// //     if (!MaMon || !TenMon || !Gia || !Loai) {
// //         return res.render('admin/pages/addDish', {
// //             layout: 'admin_layouts/mainAdmin',
// //             title: 'Add Dish',
// //             errorMessage: 'All fields are required.',
// //         });
// //     }

// //     try {
// //         const pool = await poolPromise;
// //         await pool.request()
// //             .input('MaMon', sql.Char(5), MaMon)
// //             .input('TenMon', sql.NVarChar(50), TenMon)
// //             .input('Gia', sql.Int, Gia)
// //             .input('Loai', sql.NVarChar(50), Loai)
// //             .query('INSERT INTO mon_an (MaMon, TenMon, Gia, Loai) VALUES (@MaMon, @TenMon, @Gia, @Loai)');

// //         res.redirect('/admin/menu');
// //     } catch (error) {
// //         console.error('Error adding dish:', error);
// //         res.status(500).send('Error adding dish');
// //     }
// // };

// // Thêm món ăn
// module.exports.addDish = async (req, res) => {
//     const { MaMon, TenMon, Gia, Loai } = req.body;

//     if (!MaMon || !TenMon || !Gia || !Loai) {
//         return res.render('admin/pages/addDish', {
//             layout: 'admin_layouts/mainAdmin',
//             title: 'Add Dish',
//             errorMessage: 'All fields are required.',
//         });
//     }

//     try {
//         const pool = await poolPromise;

//         await pool.request()
//             .input('MaMon', sql.Char(5), MaMon)
//             .input('TenMon', sql.NVarChar(50), TenMon)
//             .input('Gia', sql.Int, Gia)
//             .input('Loai', sql.NVarChar(50), Loai)
//             .execute('them_mon_an'); 

//         res.redirect('/admin/menu');
//     } catch (error) {
//         console.error('Error adding dish:', error);

//         res.render('admin/pages/addDish', {
//             layout: 'admin_layouts/mainAdmin',
//             title: 'Add Dish',
//             errorMessage: 'An error occurred while adding the dish. Please try again.',
//         });
//     }
// };

//-------------------------------------------------------------------------------------------

// Hiển thị form sửa món ăn
module.exports.renderEditDishForm = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaMon', sql.Char(5), id)
            .query('SELECT * FROM mon_an WHERE MaMon = @MaMon');

        if (result.recordset.length === 0) {
            return res.status(404).send('Dish not found');
        }

        res.render('admin/pages/editDish', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Edit Dish',
            dish: result.recordset[0],
        });
    } catch (error) {
        console.error('Error fetching dish:', error);
        res.status(500).send('Error fetching dish');
    }
};

// Sửa món ăn
module.exports.editDish = async (req, res) => {
    const { id } = req.params;
    const { TenMon, Gia, Loai } = req.body;

    if (!TenMon || !Gia || !Loai) {
        return res.render('admin/pages/editDish', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Edit Dish',
            errorMessage: 'All fields are required.',
            dish: { MaMon: id, TenMon, Gia, Loai },
        });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MaMon', sql.Char(5), id)
            .input('TenMon', sql.NVarChar(50), TenMon)
            .input('Gia', sql.Int, Gia)
            .input('Loai', sql.NVarChar(50), Loai)
            .query('UPDATE mon_an SET TenMon = @TenMon, Gia = @Gia, Loai = @Loai WHERE MaMon = @MaMon');

        res.redirect('/admin/menu');
    } catch (error) {
        console.error('Error updating dish:', error);
        res.status(500).send('Error updating dish');
    }
};

// Xoá món ăn
module.exports.deleteDish = async (req, res) => {
    try {
        const { id } = req.params;
        const { regionId, branchId } = req.query;
        console.log(req.params);
        if (!id) {
            return res.status(400).send('Dish ID is required');
        }

        const pool = await poolPromise;

        // case chưa chọn region và branch
        if (!regionId && !branchId) {
            await pool.request()
                .input('MaMon', sql.Char(5), id)
                .execute('xoa_mon_an');
        }

        else if (branchId) {
            await pool.request()
                .input('MaCN', sql.Int, branchId)
                .input('MaMon', sql.Char(5), id)
                .execute('xoa_mon_an_chi_nhanh');
        }

        else if (regionId) {
            await pool.request()
                .input('MaKV', sql.Int, regionId)
                .input('MaMon', sql.Char(5), id)
                .execute('xoa_mon_an_khu_vuc');
        }

        res.redirect('/admin/menu');
    } catch (error) {
        console.error('Error deleting dish:', error);
        res.status(500).send('Error deleting dish');
    }
};

// tìm kiếm món ăn
module.exports.searchDish = async (req, res) => {
    const { searchBy, searchInput } = req.query;

    if (!searchBy || !searchInput) {
        return res.render('admin/pages/menu', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Menu Management',
            errorMessage: 'Please provide a search criteria and keyword.',
        });
    }

    try {
        const pool = await poolPromise;
        let result;

        if (searchBy === 'maMon') {
            result = await pool.request()
                .input('ma_mon', sql.Char(5), searchInput)
                .execute('tim_mon_an_ma_mon');
        } else if (searchBy === 'tenMon') {
            result = await pool.request()
                .input('input_str', sql.NVarChar(50), searchInput)
                .execute('tim_mon_an_ten_mon');
        } else {
            throw new Error('Invalid search criteria');
        }

        res.render('admin/pages/menu', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Menu Management',
            dishes: result.recordset,
        });
    } catch (error) {
        // console.error('Error searching dish:', error);

        res.status(404).render('admin/pages/menu', {
            layout: 'admin_layouts/mainAdmin',
            title: 'Dish Search',
            errorMessage: 'No dishes found matching the search criteria.',
            dishes: [],
            searchTerm: req.body.searchTerm
        });
    }

};


// NOTE