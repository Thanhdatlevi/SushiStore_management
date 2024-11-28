const db = require('../../config/db'); // Giả sử bạn có một tệp db.js để kết nối với cơ sở dữ liệu

const Tour = {
	// getToursByLocation: async (location_name) => {
	// 	const query = `
	// 	select t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.location_id
	// 	from tours t inner join locations l on t.location_id = l.location_id
	// 				inner join tour_images t_i on t.tour_id = t_i.tour_id
	// 			where l.location_name = $1 and t_i.img_id = 1
	// 	`;
	// 	const values = [location_name];
	// 	try {
	// 		const result = await db.query(query, values);
	// 		return result.rows;
	// 	} catch (err) {
	// 		throw new Error('Error fetching tours by location: ' + err.message);
	// 	}
	// },
	getTours: async (page,search, location, rate, price, voucher) => {
		const searchs = await Tour.searchTours(search);
		const locations = await Tour.filterlocationTours(location);
		const rates = await Tour.filterrateTours(rate);
		const prices = await Tour.filterpriceTours(price);
		const vouchers = await Tour.filtervoucherTours(voucher);

		const tourIds1 = searchs.map(item => item.tour_id);
		const tourIds2 = locations.map(item => item.tour_id);
		const tourIds3 = rates.map(item => item.tour_id);
		const tourIds4 = prices.map(item => item.tour_id);
		const tourIds5 = vouchers.map(item => item.tour_id);

		// Tìm các tour_id xuất hiện trong tất cả 5 mảng
		const commonTourIds = tourIds1.filter(id =>
			tourIds2.includes(id) &&
			tourIds3.includes(id) &&
			tourIds4.includes(id) &&
			tourIds5.includes(id)
		);

		// Lọc các đối tượng từ các mảng tour ban đầu có tour_id xuất hiện trong commonTourIds
		const mergedTours = [
			...searchs.filter(item => commonTourIds.includes(item.tour_id)),
			...locations.filter(item => commonTourIds.includes(item.tour_id)),
			...rates.filter(item => commonTourIds.includes(item.tour_id)),
			...prices.filter(item => commonTourIds.includes(item.tour_id)),
			...vouchers.filter(item => commonTourIds.includes(item.tour_id))
		];
		const uniqueTours = mergedTours.filter((value, index, self) =>
			index === self.findIndex((t) => t.tour_id === value.tour_id)
		);
            const totalTours = uniqueTours.length;
            const totalPages = Math.ceil(totalTours / 6);
            const startIndex = (page - 1) * 6;
            const paginatedTours = uniqueTours.slice(startIndex, startIndex + 6);
		return {paginatedTours,totalPages}

	},

	searchTours: async (searchQuery) => {
		const query = `SELECT t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.location_id
					FROM tours t 
					left join tour_images t_i ON t.tour_id = t_i.tour_id 
					WHERE t_i.img_id = 1 AND ($1 = 'default' OR t.title LIKE CONCAT('%', $1, '%')) AND ($1 = 'default' OR t.brief LIKE CONCAT('%', $1, '%'))`;
		const values = [searchQuery];
		try {
			const result = await db.query(query, values); // Remove values here
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
	filterpriceTours: async (priceQuery) => {
		if (!Array.isArray(priceQuery)) { priceQuery = [priceQuery] }
		const query = `
        SELECT t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.location_id
        FROM tours t
        LEFT JOIN tour_images t_i ON t.tour_id = t_i.tour_id
        WHERE t_i.img_id = 1
        AND (
			${priceQuery[0]} = -1 or
            ${priceQuery.map((price, index) => `
                (t.prices >= CAST(${price} AS REAL) AND t.prices <= CAST(${price} AS REAL)+99)
                ${index < priceQuery.length - 1 ? 'OR' : ''}
            `).join('')}
        )
    `;
		try {
			const result = await db.query(query); // Remove values here
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
	filterrateTours: async (rateQuery) => {
		if (!Array.isArray(rateQuery)) { rateQuery = [rateQuery] }
		const query = `
        SELECT t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.location_id
        FROM tours t
        LEFT JOIN tour_images t_i ON t.tour_id = t_i.tour_id
        WHERE t_i.img_id = 1
        AND (
			${rateQuery[0]} = -1 or
            ${rateQuery.map((rate, index) => `
                (t.rate =  CAST(${rate} AS INT))
                ${index < rateQuery.length - 1 ? 'OR' : ''}
            `).join('')}
        )
    `;
		try {
			const result = await db.query(query); // Remove values here
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
	filtervoucherTours: async (voucherQuery) => {
		if (!Array.isArray(voucherQuery)) { voucherQuery = [voucherQuery] }
		const query = `
        SELECT t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.location_id
        FROM tours t
        LEFT JOIN tour_images t_i ON t.tour_id = t_i.tour_id
        WHERE t_i.img_id = 1
        AND (
			${voucherQuery[0]} = -1 or
            ${voucherQuery.map((voucher, index) => `
                (t.voucher >= CAST(${voucher} AS REAL) AND t.voucher <= CAST(${voucher} AS REAL) + 4)
                ${index < voucherQuery.length - 1 ? 'OR' : ''}
            `).join('')}
        )
    `;
		try {
			const result = await db.query(query); // Remove values here
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
	filterlocationTours: async (locationQuery) => {
		if (!Array.isArray(locationQuery)) { locationQuery = [locationQuery] }
		const query = `
        SELECT t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.location_id
        FROM tours t
        LEFT JOIN tour_images t_i ON t.tour_id = t_i.tour_id
		left join locations lo on lo.location_id = t.location_id
        WHERE t_i.img_id = 1
        AND (
			'${locationQuery[0]}' like 'default' or
            ${locationQuery.map((location, index) => `
                (lo.location_name like CONCAT('%', '${location}', '%'))
                ${index < locationQuery.length - 1 ? 'OR' : ''}
            `).join('')}
        )
    `;
		try {
			const result = await db.query(query); // Remove values here
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},

	getTourByID: async (tour_id) => {
		const query = ` SELECT t.*, t_i.img_url
        FROM tours t
        LEFT JOIN (
            SELECT tour_id, img_url
            FROM tour_images
            WHERE tour_id = $1
            LIMIT 3
        ) t_i ON t.tour_id = t_i.tour_id
        WHERE t.tour_id = $1`;
		const values = [tour_id];
		try {
			const result = await db.query(query, values);
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}

	},

	getToursByIDLocation: async (tour_id) => {
		const query = `
		select t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.location_id
		from tours t inner join tour_images t_i on t.tour_id = t_i.tour_id
				inner join tours c on c.tour_id = $1 and c.location_id = t.location_id
				where  t_i.img_id = 1 and t.tour_id != $1
		`;
		const values = [tour_id];
		try {
			const result = await db.query(query, values);
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},

	getBestdealTours: async () => {
		const query = `
		select t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.rate,t.voucher, t.location_id
		from tours t inner join locations l on t.location_id = l.location_id
					inner join tour_images t_i on t.tour_id = t_i.tour_id
		where t.rate>=4 and t.voucher>=8 and t_i.img_id = 1
		order by rate DESC
		limit 3
		`;
		try {
			const result = await db.query(query);
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},

	getBestrateTours: async () => {
		const query = `
		select t.tour_id, t.title, t.brief, t.prices, t_i.img_url, t.rate,t.voucher, t.location_id
		from tours t inner join locations l on t.location_id = l.location_id
					inner join tour_images t_i on t.tour_id = t_i.tour_id
		where t.rate>=4 and t.prices<=150.0 and t_i.img_id = 1
		order by rate DESC
		limit 3
		`;
		try {
			const result = await db.query(query);
			return result.rows;
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
};

module.exports = Tour;