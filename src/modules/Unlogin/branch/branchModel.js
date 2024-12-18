const {poolPromise} = require('../../../config/db');

const Branch = {
    getAllBranch: async () => {

		const query = `
		select *
		from chi_nhanh
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

	getdiliveryBranch: async () => {

		const query = `
		select *
		from chi_nhanh cn
		where cn.GiaoHang = 1
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

module.exports = Branch;