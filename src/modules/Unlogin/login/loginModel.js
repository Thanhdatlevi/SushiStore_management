const {pool} = require('../../../config/db');

const Branch = {
    checkLogin: async (username, password) => {

		const query = `
		select a.userID, a.userType, a.accUserName
        from account a
        where a.accUserName = '${username}' and  a.accPassword = '${password}'
		`;
        console.log(query)
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

module.exports = Branch;