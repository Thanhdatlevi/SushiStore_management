const {pool} = require('../../../config/db');

const Dish = {
    getAllDish: async (page, location, branch, minPrice, maxPrice) => {

		const query = `
		select distinct ma.MaMon, ma.TenMon, ma.Gia, ma.Loai
		from mon_an ma
		join mon_an_chi_nhanh macn on  macn.MaMon = ma.MaMon
		join mon_an_khu_vuc makv on makv.MaMon = ma.MaMon
		where (${location} = -1 or (makv.MaKhuVuc = ${location}))
		and (${branch} = -1 or (macn.MaCN = ${branch}))
		and (ma.Gia >= ${minPrice})
		and (ma.Gia <= ${maxPrice})
		`;
		try {
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset

			const totalTours = test.length;
			const totalPages = Math.ceil(totalTours / 6);
			const startIndex = (page - 1) * 6;
			const paginatedTours = test.slice(startIndex, startIndex + 6);
			return { paginatedTours, totalPages }
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
            await pool.connect()
			const result = await pool.request().query(query);
            const test = result.recordset
			return test 
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
}

module.exports = Dish;