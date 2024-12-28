const {poolPromise} = require('../../../config/db');

const Dish = {
    getAllDish: async (page, branch, minPrice, maxPrice) => {

		const query = `
		select distinct ma.MaMon, ma.TenMon, ma.Gia, ma.Loai
		from mon_an ma
		join mon_an_chi_nhanh macn on  macn.MaMon = ma.MaMon
		join mon_an_khu_vuc makv on makv.MaMon = ma.MaMon
		where (${branch} = -1 or (macn.MaCN = ${branch}))
		and (ma.Gia >= ${minPrice})
		and (ma.Gia <= ${maxPrice})
		`;
		try {
            const pool = await poolPromise;
			const result = await pool.request().query(query);

            const test = result.recordset

			const totalDishs = test.length;
			const totalPages = Math.ceil(totalDishs / 14);
			const startIndex = (page - 1) * 18;
			const paginatedDishs = test.slice(startIndex, startIndex + 14);
			return { paginatedDishs, totalPages }
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},

	getDishbyBranch: async (idBranch) => {

		const query = `
		select distinct ma.MaMon, ma.TenMon, ma.Gia
		from mon_an ma
		join mon_an_chi_nhanh macn on ma.MaMon = macn.MaMon and macn.MaCN = ${idBranch}
		`;
		try {
            const pool = await poolPromise;

			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
}

module.exports = Dish;