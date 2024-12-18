const {poolPromise} = require('../../../config/db');

const Dish = {
    getAllDish: async (userID, page, minPrice, maxPrice) => {

		const query = `
		select distinct ma.MaMon, ma.TenMon, ma.Gia, ma.Loai, macn.GiaoHang
		from mon_an ma
		join mon_an_chi_nhanh macn on  macn.MaMon = ma.MaMon
		join nhan_vien nv on nv.ChiNhanh = macn.MaCN
		and (ma.Gia >= ${minPrice})
		and (ma.Gia <= ${maxPrice})
		and nv.MaNV='${userID}'
		`;
		try {
            const pool = await poolPromise;
			const result = await pool.request().query(query);
            const test = result.recordset

			const totalTours = test.length;
			const totalPages = Math.ceil(totalTours / 6);
			const startIndex = (page - 1) * 6;
			const paginatedTours = test.slice(startIndex, startIndex + 6);
			return { paginatedTours, totalPages }
		} catch (err) {
			throw new Error('Error get all dish in branch ' + err.message);
		}
	},

	getDishbyBranch: async (EmployID) => {
		const query = `
		select distinct ma.MaMon, ma.TenMon, ma.Gia
		from mon_an ma
		join mon_an_chi_nhanh macn on ma.MaMon = macn.MaMon
		join nhan_vien nv on macn.MaCn = nv.ChiNhanh and nv.MaNV = '${EmployID}'
		`;
		try {
            const pool = await poolPromise;
			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error get dish in branch: ' + err.message);
		}
	},

	getOrderKVDish: async (EmployID) => {
		const query = `
		SELECT makv.MaMon, ma.TenMon
		FROM mon_an_khu_vuc makv
		join mon_an ma on ma.MaMon=makv.MaMon
		join chi_nhanh cn on cn.MaKhuVuc = makv.MaKhuVuc
		join nhan_vien nv on nv.ChiNhanh = cn.MaCN and nv.MaNV = '${EmployID}'
		WHERE makv.MaMon NOT IN (SELECT macn.MaMon 
							FROM mon_an_chi_nhanh macn
							join chi_nhanh cn2 on macn.MaCN = cn2.MaCN and cn2.MaCN = cn.MaCN
							);
		`;
		try {
            const pool = await poolPromise;
			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error get dish in branch: ' + err.message);
		}
	},

	deleteByEmployee: async (dishID, EmployID) => {

		const query = `
		DELETE FROM mon_an_chi_nhanh 
    	WHERE MaCN = (select nv.ChiNhanh
			from nhan_vien nv
			where nv.MaNV = '${EmployID}') AND
            MaMon = '${dishID}'
		`;
		try {
            const pool = await poolPromise;
			await pool.request().query(query);
		} catch (err) {
			throw new Error('Error delete mon an chi nhanh: ' + err.message);
		}
	},

	updateDelivery: async (MaMon, GiaoHang,EmployID) => {

		const query = `
		update mon_an_chi_nhanh
		set GiaoHang = ${GiaoHang}
		where MaMon = '${MaMon}' and MaCN = (select nv.ChiNhanh
			from nhan_vien nv
			where nv.MaNV = '${EmployID}')
		`;
		try {
            const pool = await poolPromise;
			await pool.request().query(query);
		} catch (err) {
			throw new Error('Error delete mon an chi nhanh: ' + err.message);
		}
	},

	addDishToBranch: async (MaMon, GiaoHang,EmployID) => {

		const query = `
		insert into mon_an_chi_nhanh (MaCN, MaMon, GiaoHang)
		values ((select nv.ChiNhanh
			from nhan_vien nv
			where nv.MaNV = '${EmployID}'), '${MaMon}', ${GiaoHang})
		`;
		try {
			const pool = await poolPromise;
			await pool.request().query(query);
		} catch (err) {
			throw new Error('Error delete mon an chi nhanh: ' + err.message);
		}
	},
}

module.exports = Dish;