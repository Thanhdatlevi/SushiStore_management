const {poolPromise} = require('../../../config/db');

const Reserve = {
    getMaxMP: async () => {

		const query = `
		SELECT 
			RIGHT('000000' + CAST(CAST(pd.MaPhieu AS INT) + 1 AS VARCHAR), 6) AS next_MaPhieu
		FROM phieu_dat pd
		WHERE pd.MaPhieu = (SELECT MAX(pd1.MaPhieu) FROM phieu_dat pd1);
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
	submitReserveDish: async ( branchId, orderDetails,MaxMPs,onlineTime,timer,userID) => {
		const sqlOrder= `
		INSERT INTO phieu_dat (MaPhieu, NgayDat, MaCN, NhanVienLap, CCCD, LoaiPhieu)
        VALUES ('${MaxMPs}', getdate(), ${branchId}, null, (select kh.CCCD
																from khach_hang kh
																join the t on t.MaThe = '${userID}' and t.CCCD=kh.CCCD), 3);

		INSERT INTO giao_hang (MaPhieu, ThoiDiemOnline, ThoiGianOnline)
        VALUES ('${MaxMPs}', N'${onlineTime}', N'${timer}');
		`;

		const sqlMMPD = orderDetails.map(element => `
			INSERT INTO ma_mon_phieu_dat (MaPhieu, MaMon, SoLuong, DatTruoc)
			VALUES ('${MaxMPs}', '${element.MaMon}', ${element.SoLuong}, 0);
		`).join('\n');
		const query = sqlOrder + '\n' + sqlMMPD;
		console.log(query)
		try {
            const pool = await poolPromise;
			await pool.request().query(query);
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},

	submitReserveTable: async ( branchId,khuvucId, orderDetails,MaxMPs, userID,date,time,note,guestCount) => {
		const sqlOrder= `
		INSERT INTO phieu_dat (MaPhieu, NgayDat, MaCN, NhanVienLap, CCCD, LoaiPhieu)
        VALUES ('${MaxMPs}', '${date}', ${branchId}, null, (select kh.CCCD
			from khach_hang kh
			join the t on t.MaThe = '${userID}' and t.CCCD=kh.CCCD), 2);

		INSERT INTO dat_ban_online (MaPhieu, KhuVuc, SoLuongKhach, GioDen, GhiChu)
        VALUES ('${MaxMPs}', ${khuvucId}, ${guestCount},'${time}', N'${note}');
		`;

		const sqlMMPD = orderDetails.map(element => `
			INSERT INTO ma_mon_phieu_dat (MaPhieu, MaMon, SoLuong, DatTruoc)
			VALUES ('${MaxMPs}', '${element.MaMon}', ${element.SoLuong}, 1);
		`).join('\n');
		const query = sqlOrder + '\n' + sqlMMPD;
		console.log(query)
		try {
            const pool = await poolPromise;
			await pool.request().query(query);
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},
	getReserveDishByUserID: async (userID) => {
		const query = `
		select pd.MaPhieu, pd.NgayDat, pd.MaCN, cn.TenCN,
			ISNULL((
				SELECT 
					mmpd.MaMon,
					ma.TenMon,
					mmpd.SoLuong
				FROM ma_mon_phieu_dat mmpd
				JOIN mon_an ma ON ma.MaMon = mmpd.MaMon
				WHERE mmpd.MaPhieu = pd.MaPhieu
				FOR JSON PATH
			), '[]') AS DanhSachMonAn
		from phieu_dat pd
		join giao_hang gh on gh.MaPhieu=pd.MaPhieu
		join chi_nhanh cn on cn.MaCN = pd.MaCN
		where pd.CCCD= (select kh.CCCD
			from khach_hang kh
			join the t on t.MaThe = '${userID}' and t.CCCD=kh.CCCD)
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
	getReserveTableByUserID: async (userID) => {
		const query = `
		select pd.MaPhieu, pd.NgayDat, pd.MaCN, cn.TenCN,dbol.KhuVuc, dbol.GioDen, dbol.SoLuongKhach,dbol.GhiChu,ISNULL((
			SELECT 
				mmpd.MaMon,
				ma.TenMon,
				mmpd.SoLuong
			FROM ma_mon_phieu_dat mmpd
			JOIN mon_an ma ON ma.MaMon = mmpd.MaMon
			WHERE mmpd.MaPhieu = pd.MaPhieu
			FOR JSON PATH
		), '[]') AS DanhSachMonAn
		from phieu_dat pd
		join dat_ban_online dbol on dbol.MaPhieu = pd.MaPhieu
		join chi_nhanh cn on cn.MaCN = pd.MaCN
		join khu_vuc kv on kv.MaKhuVuc=dbol.KhuVuc
		where pd.CCCD= (select kh.CCCD
			from khach_hang kh
			join the t on t.MaThe = '${userID}' and t.CCCD=kh.CCCD)
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

module.exports = Reserve;