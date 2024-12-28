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
	submitReserveDish: async ( orderDetails,MaxMPs,cccd,SoBan, userID) => {
		const sqlOrder= `
		INSERT INTO phieu_dat (MaPhieu, NgayDat, MaCN, NhanVienLap, CCCD, LoaiPhieu)
        VALUES ('${MaxMPs}', getdate(), (select nv.ChiNhanh
			from nhan_vien nv
			where nv.MaNV = '${userID}'), '${userID}', '${cccd}', 1);

		INSERT INTO order_tai_cho (MaPhieu, SoBan)
        VALUES ('${MaxMPs}', ${SoBan});
		`;

		const sqlMMPD = orderDetails.map(element => `
			INSERT INTO ma_mon_phieu_dat (MaPhieu, MaMon, SoLuong, DatTruoc)
			VALUES ('${MaxMPs}', '${element.MaMon}', ${element.SoLuong}, 0);
		`).join('\n');
		const query = sqlOrder + '\n' + sqlMMPD;
		try {
            const pool = await poolPromise;
			await pool.request().query(query);
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},

	submitReserveTable: async ( branchId,khuvucId, orderDetails,MaxMPs, cccd,date,time,note,guestCount) => {
		const sqlOrder= `
		INSERT INTO phieu_dat (MaPhieu, NgayDat, MaCN, NhanVienLap, CCCD, LoaiPhieu)
        VALUES ('${MaxMPs}', '${date}', ${branchId}, 'NV001', '${cccd}', 2);

		INSERT INTO dat_ban_online (MaPhieu, KhuVuc, SoLuongKhach, GioDen, GhiChu)
        VALUES ('${MaxMPs}', ${khuvucId}, ${guestCount},'${time}', N'${note}');
		`;

		const sqlMMPD = orderDetails.map(element => `
			INSERT INTO ma_mon_phieu_dat (MaPhieu, MaMon, SoLuong, DatTruoc)
			VALUES ('${MaxMPs}', '${element.MaMon}', ${element.SoLuong}, 1);
		`).join('\n');
		const query = sqlOrder + '\n' + sqlMMPD;
		try {
            const pool = await poolPromise;
			await pool.request().query(query);
		} catch (err) {
			throw new Error('Error fetching tours by location: ' + err.message);
		}
	},

	statisticsByBranch: async (employeeID) => {
		const pool = await poolPromise;
		const phieuDatQuery = `
            SELECT pd.LoaiPhieu, COUNT(*) AS SoLuongPhieu
            FROM phieu_dat pd
			join chi_nhanh cn on pd.MaCN = cn.MaCN and cn.MaCN = (select nv.ChiNhanh
				from nhan_vien nv
				where nv.MaNV = '${employeeID}') 
				  AND YEAR(pd.NgayDat) = YEAR(GETDATE())
            GROUP BY pd.LoaiPhieu;
        `;
        const phieuDat = await pool.request().query(phieuDatQuery);

		const soLuongMonQuery = `
		SELECT 
			cn.TenCN AS ChiNhanh,
			ma.TenMon AS MonAn,
			SUM(mmpd.SoLuong) AS SoLuong,
			SUM(ma.Gia * mmpd.SoLuong) AS DoanhThu
		FROM 
			phieu_dat pd
		JOIN 
			ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
		JOIN 
			mon_an ma ON mmpd.MaMon = ma.MaMon
		JOIN 
			chi_nhanh cn ON pd.MaCN = cn.MaCN
		WHERE 
		pd.MaCN = (select nv.ChiNhanh
			from nhan_vien nv
			where nv.MaNV = '${employeeID}')
			AND YEAR(pd.NgayDat) = YEAR(GETDATE())
		GROUP BY 
			cn.TenCN, ma.TenMon
		ORDER BY 
			cn.TenCN, DoanhThu DESC;
        `;
        const soLuongMon = await pool.request().query(soLuongMonQuery);
		
		const banChamQuery = `
		SELECT 
			ma.TenMon,
			pd.MaCN,
			SUM(mmpd.SoLuong) AS SoLuong
		FROM 
			phieu_dat pd
		JOIN 
			ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
		JOIN 
			mon_an ma ON mmpd.MaMon = ma.MaMon
		where pd.MaCN = (select nv.ChiNhanh
			from nhan_vien nv
			where nv.MaNV = '${employeeID}')
		GROUP BY 
			ma.TenMon, pd.MaCN
		HAVING 
			SUM(mmpd.SoLuong) >= all (
				SELECT SUM(mmpd2.SoLuong)
				FROM phieu_dat pd2
				JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
				WHERE pd2.MaCN = pd.MaCN
				GROUP BY mmpd2.MaMon
			);
        `;
        const banCham = await pool.request().query(banChamQuery);
		
		const banChayQuery = `
		SELECT 
			ma.TenMon,
			pd.MaCN,
			SUM(mmpd.SoLuong) AS SoLuong
		FROM 
			phieu_dat pd
		JOIN 
			ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
		JOIN 
			mon_an ma ON mmpd.MaMon = ma.MaMon
		where pd.MaCN = (select nv.ChiNhanh
			from nhan_vien nv
			where nv.MaNV = '${employeeID}')
		GROUP BY 
			ma.TenMon, pd.MaCN
		HAVING 
			SUM(mmpd.SoLuong) <= all (
				SELECT SUM(mmpd2.SoLuong)
				FROM phieu_dat pd2
				JOIN ma_mon_phieu_dat mmpd2 ON pd2.MaPhieu = mmpd2.MaPhieu
				WHERE pd2.MaCN = pd.MaCN
				GROUP BY mmpd2.MaMon
			);
        `;
        const banChay = await pool.request().query(banChayQuery);
		
		const doanhThuQuery = `
		SELECT 
			SUM(ma.Gia * mmpd.SoLuong) AS TongDoanhThu
		FROM 
			phieu_dat pd
		JOIN 
			ma_mon_phieu_dat mmpd ON pd.MaPhieu = mmpd.MaPhieu
		JOIN 
			mon_an ma ON mmpd.MaMon = ma.MaMon
		JOIN 
			chi_nhanh cn ON pd.MaCN = cn.MaCN
		WHERE 
			pd.MaCN = (
				SELECT nv.ChiNhanh
				FROM nhan_vien nv
				WHERE nv.MaNV = '${employeeID}'
			)
			AND MONTH(pd.NgayDat) = MONTH(GETDATE());
        `;
		console.log(doanhThuQuery)
        const doanhThu = await pool.request().query(doanhThuQuery);
		try {
			return {
				SoLuongPhieu: phieuDat.recordset,
				SoLuongMon: soLuongMon.recordset,
				BanChay: banChay.recordset || null,
				BanCham: banCham.recordset || null,
				DoanhThu: doanhThu.recordset ||[],
			}
		} catch (err) {
			throw new Error('Error thong ke doanh thu: ' + err.message);
		}
	},
	getReserveDishByUserID: async (userID) => {
		const query = `
		select pd.MaPhieu, pd.NgayDat, pd.MaCN, cn.TenCN,(
				SELECT 
					mmpd.MaMon,
					ma.TenMon,
					mmpd.SoLuong
				FROM ma_mon_phieu_dat mmpd
				join mon_an ma on ma.MaMon=mmpd.MaMon
				WHERE mmpd.MaPhieu=pd.MaPhieu
				FOR JSON PATH
			) AS DanhSachMonAn
		from phieu_dat pd
		join giao_hang gh on gh.MaPhieu=pd.MaPhieu
		join chi_nhanh cn on cn.MaCN = pd.MaCN
		where pd.CCCD= '${userID}'
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
		select pd.MaPhieu, pd.NgayDat, pd.MaCN, cn.TenCN,dbol.KhuVuc, dbol.GioDen, dbol.SoLuongKhach,dbol.GhiChu,(
				SELECT 
					mmpd.MaMon,
					ma.TenMon,
					mmpd.SoLuong
				FROM ma_mon_phieu_dat mmpd
				join mon_an ma on ma.MaMon=mmpd.MaMon
				WHERE mmpd.MaPhieu=pd.MaPhieu
				FOR JSON PATH
			) AS DanhSachMonAn
		from phieu_dat pd
		join dat_ban_online dbol on dbol.MaPhieu = pd.MaPhieu
		join chi_nhanh cn on cn.MaCN = pd.MaCN
		join khu_vuc kv on kv.MaKhuVuc=dbol.KhuVuc
		where pd.CCCD= '${userID}'
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