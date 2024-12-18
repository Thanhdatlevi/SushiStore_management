--Mã món đặt trước (mamon_phieudat) phải có mã phiếu trùng với mã phiếu của order đặt bàn online 
-- CREATE TRIGGER check_mon_dat_truoc
-- ON ma_mon_phieu_dat
-- AFTER INSERT, UPDATE 
-- AS
-- BEGIN 
-- END;
-- GO

--Món ăn được đặt(mamon_phieudat) phải nằm trong danh sách thực đơn của chi nhánh(mamon_chinhanh).
CREATE TRIGGER check_ma_mon_phieu_dat
ON ma_mon_phieu_dat
AFTER INSERT, UPDATE 
AS
BEGIN 

    IF EXISTS (SELECT 1 
                FROM INSERTED new JOIN
                phieu_dat pd ON pd.MaPhieu = new.MaPhieu
                WHERE new.DatTruoc = 1 AND pd.LoaiPhieu != 2)
    BEGIN
        RAISERROR(N'Mã phiếu của món ăn đặt trước không trùng với mã phiếu của order đặt bàn online', 16, 1)
        ROLLBACK TRANSACTION;
    END

    IF(0 >= ANY (SELECT COUNT(distinct mcn.MaMon) 
				 FROM INSERTED new 
				 JOIN phieu_dat o ON new.MaPhieu = o.MaPhieu
				 JOIN chi_nhanh cn ON o.MaCN = cn.MaCN 
				 JOIN mon_an_chi_nhanh mcn ON new.MaMon = mcn.MaMon
                 GROUP BY new.MaMon, mcn.MaCN))
    BEGIN
        RAISERROR(N'Món ăn được đặt không nằm trong danh sách thực đơn của chi nhánh', 16, 1)
        ROLLBACK TRANSACTION;
    END

    IF EXISTS (SELECT 1 FROM 
                INSERTED new JOIN
                phieu_dat o ON new.MaPhieu = o.MaPhieu JOIN 
                mon_an_chi_nhanh mcn ON mcn.MaCN = o.MaCN
                WHERE mcn.MaMon = new.MaMon AND
                mcn.GiaoHang = 0 AND 
                o.LoaiPhieu = 3)
    BEGIN 
            RAISERROR(N'Món ăn đặt trong order giao hàng phải được giao bởi chi nhánh',16, 1);
        ROLLBACK TRANSACTION;
    END 
END;
GO

-- Các món ăn nằm trong đơn giao hàng phải là các món có thể giao (biến bool giaohang  = true trong bảng monan_chinhanh) 
-- CREATE TRIGGER ma_mon_phieu_dat_check_giao_hang
-- ON ma_mon_phieu_dat
-- AFTER INSERT, UPDATE 
-- AS 
-- BEGIN 
--     -- DECLARE @MaPhieu CHAR(5) 
--     -- SELECT @MaPhieu = NEW.MaPhieu
--
--
-- END;
-- GO

--  Mọi món ăn nằm trong chi nhánh phải nằm trong danh sách món của khu vực mà chi nhánh thuộc về 
CREATE TRIGGER mon_an_chi_nhanh_trigger
ON mon_an_chi_nhanh
AFTER INSERT, UPDATE 
AS
BEGIN 
    IF(0 >= ANY (SELECT COUNT(distinct mkv.MaMon) FROM INSERTED new JOIN 
                chi_nhanh cn ON new.MaCN = cn.MaCN LEFT JOIN
                mon_an_khu_vuc mkv ON mkv.MaKhuVuc = cn.MaKhuVuc AND
                                        new.MaMon = mkv.MaMon
                GROUP BY new.MaMon, new.MaCN))
    BEGIN
        RAISERROR(N'Món ăn của chi nhánh không có tại khu vực mà chi nhánh thuộc về', 16, 1)
        ROLLBACK TRANSACTION
    END
END;
GO

CREATE TRIGGER mon_an_khu_vuc_del_trigger
ON mon_an_khu_vuc
AFTER DELETE
AS
BEGIN
    DECLARE @cur CURSOR;
    DECLARE @macn INT;
    DECLARE @mamon char(5);

    SET @cur = CURSOR FOR 
    SELECT distinct macn.MaCN, macn.MaMon 
    FROM chi_nhanh cn JOIN
    DELETED del ON del.MaKhuVuc = cn.MaKhuVuc JOIN
    mon_an_chi_nhanh macn ON macn.MaCN = cn.MaCN AND
                            macn.MaMon = del.MaMon

    OPEN @cur
    FETCH NEXT FROM @cur 
    INTO @macn, @mamon
    
    WHILE @@FETCH_STATUS = 0
    BEGIN 

        DELETE FROM mon_an_chi_nhanh
        WHERE MaCN = @macn AND 
            MaMon = @mamon                   

        FETCH NEXT FROM @cur 
        INTO @macn, @mamon
    END
    CLOSE @cur;
    DEALLOCATE @cur;
END
go
--
                            
-- Nhân viên lập phiếu phải là nhân viên của chi nhánh và đang làm việc tại chi nhánh trong thời gian lập phiếu

CREATE TRIGGER order_trigger
ON phieu_dat
AFTER INSERT, UPDATE
AS 
BEGIN 

    IF 1 <= ANY(SELECT count(DISTINCT nv.MaNV) FROM 
                INSERTED new JOIN 
                chi_nhanh cn ON new.MaCN = cn.MaCN LEFT JOIN
                nhan_vien nv ON new.NhanVienLap = nv.MaNV AND
                                nv.ChiNhanh != new.MaCN
                GROUP BY new.MaCN, new.NhanVienLap)
    BEGIN
        RAISERROR(N'Nhân viên lập phiếu phải đang làm việc tại chi nhánh được tạo đơn hàng', 16, 1)
        ROLLBACK TRANSACTION
    END
END;
GO

-- Giờ đến của đặt bàn online phải nằm trong khung giờ hoạt động của chi nhánh
CREATE TRIGGER dat_ban_online_trigger 
ON dat_ban_online
AFTER INSERT, UPDATE
AS
BEGIN 
    -- SELECT new.MaPhieu, o.MaCN, COUNT(DISTINCT cn.MaCN)  
    --         FROM INSERTED new JOIN 
    --         phieu_dat o ON new.MaPhieu = o.MaPhieu JOIN
    --         chi_nhanh cn ON o.MaCN = cn.MaCN  
    --         WHERE new.GioDen < cn.GioMo OR 
    --                 new.GioDen > cn.GioDong
    --         GROUP BY new.MaPhieu, o.MaCN

    IF (1 <= ANY(SELECT COUNT(DISTINCT cn.MaCN)  
                FROM INSERTED new JOIN 
                phieu_dat o ON new.MaPhieu = o.MaPhieu JOIN
                chi_nhanh cn ON o.MaCN = cn.MaCN  
                WHERE new.GioDen < cn.GioMo OR 
                        new.GioDen > cn.GioDong
                GROUP BY new.MaPhieu, o.MaCN))
    BEGIN 
        RAISERROR(N'Giờ đến của đặt bàn online phải nằm trong giờ hoạt động của chi nhánh', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO


-- 6. loại thẻ phải được điều chỉnh dựa trên tiêu dùng tích lũy này theo các tiêu chí định trước và loại thẻ sẽ ảnh hưởng tới mức ưu đãi, giảm giá cho hóa đơn. 
	-- silver (10 triệu không tính ngày giới hạn) , ngày hôm nay - ngày cập nhật >= 1 năm -> tiêu dùng phải >= 5 triệu -> sau đó đặt tiêu dùng về 0
	-- gold ( phải có silver) trong vòng 1 năm phải 10 triệu 
CREATE TRIGGER Trg_CapNhatLoaiThe
ON the
AFTER UPDATE, INSERT
AS
BEGIN
    -- Điều kiện xuống hạng Membership nếu tiêu dùng < 50 trong 1 năm
    UPDATE the
    SET LoaiThe = 'Membership',
        NgayLap = GETDATE(),
        CapNhat = GETDATE()
    WHERE LoaiThe = 'Silver'
      AND DATEDIFF(YEAR, NgayLap, GETDATE()) > 1 -- Quá 1 năm
      AND TieuDung < 50; -- Tích lũy dưới 50

    -- Điều kiện đạt hạng Silver
    UPDATE the
    SET LoaiThe = 'Silver',
        TieuDung = 0,
        NgayLap = GETDATE(),
        CapNhat = GETDATE()
    WHERE (LoaiThe IS NULL OR LoaiThe = 'Membership') -- Thẻ chưa đạt hạng
      AND TieuDung >= 100; -- Tích lũy từ 100

    -- Giữ hạng Silver nếu tiêu dùng >= 500 trong 1 năm
    UPDATE the
    SET LoaiThe = 'Silver',
        CapNhat = GETDATE()
    WHERE LoaiThe = 'Silver'
      AND DATEDIFF(YEAR, NgayLap, GETDATE()) <= 1 -- Trong 1 năm
      AND TieuDung >= 50; -- Tích lũy từ 500

    -- Nâng hạng từ Silver lên Gold nếu tiêu dùng >= 1000 trong 1 năm
    UPDATE the
    SET LoaiThe = 'Gold',
        TieuDung = 0,
        NgayLap = GETDATE(),
        CapNhat = GETDATE()
    WHERE LoaiThe = 'Silver'
      -- AND DATEDIFF(YEAR, NgayLap, GETDATE()) <= 1 -- Trong 1 năm
      AND TieuDung >= 100; -- Tích lũy từ 1000

    -- Giữ hạng Gold nếu tiêu dùng >= 1000 trong 1 năm
    UPDATE the
    SET LoaiThe = 'Gold',
        CapNhat = GETDATE()
    WHERE LoaiThe = 'Gold'
      AND DATEDIFF(YEAR, NgayLap, GETDATE()) <= 1 -- Trong 1 năm
      AND TieuDung >= 100; -- Tích lũy từ 1000

    -- Xuống hạng từ Gold xuống Silver nếu tiêu dùng < 1000 trong 1 năm
    UPDATE the
    SET LoaiThe = 'Silver',
        NgayLap = GETDATE(),
        CapNhat = GETDATE()
    WHERE LoaiThe = 'Gold'
      AND DATEDIFF(YEAR, NgayLap, GETDATE()) > 1 -- Trong 1 năm
      AND TieuDung < 100; -- Tích lũy dưới 1000
END;
GO

-- CREATE TRIGGER check_so_dien_thoai_unique
-- ON dien_thoai_nhan_vien
-- FOR INSERT, UPDATE
-- AS
-- BEGIN
--     -- Khai báo biến để chứa số điện thoại mới thêm vào hoặc cập nhật
--     DECLARE @DienThoai NVARCHAR(11);
--     DECLARE @MaNV CHAR(5);

--     -- Lấy số điện thoại và mã nhân viên từ bảng INSERTED (chứa các bản ghi vừa được thêm hoặc cập nhật)
--     SELECT @DienThoai = DienThoai, @MaNV = MaNV
--     FROM INSERTED;

--     -- Kiểm tra xem số điện thoại này đã tồn tại trong bảng nhan_vien hay chưa
--     IF EXISTS (SELECT 1 FROM dien_thoai_nhan_vien WHERE DienThoai = @DienThoai AND MaNV <> @MaNV)
--     BEGIN
--         -- Nếu số điện thoại đã tồn tại cho nhân viên khác, hủy thao tác và thông báo lỗi
--         RAISERROR('Số điện thoại này đã được sử dụng bởi nhân viên khác!', 16, 1);
--         ROLLBACK TRANSACTION;
--     END
-- END;
-- GO

-- CREATE TRIGGER trg_CheckEndDateBeforeStartDate
-- ON lich_su_lam_viec
-- FOR INSERT, UPDATE
-- AS
-- BEGIN
--     SELECT *
--         FROM lich_su_lam_viec lsv1
--         JOIN inserted i ON lsv1.MaNV = i.MaNV
--         WHERE lsv1.MaNV = i.MaNV
--         AND lsv1.ChiNhanh <> i.ChiNhanh
--         AND lsv1.NgayKetThuc > i.NgayBatDau
--     -- Kiểm tra xem khi nhân viên chuyển chi nhánh, ngày kết thúc tại chi nhánh cũ phải trước ngày bắt đầu tại chi nhánh mới
--     IF EXISTS (
--         SELECT 1
--         FROM lich_su_lam_viec lsv1
--         JOIN inserted i ON lsv1.MaNV = i.MaNV
--         WHERE lsv1.MaNV = i.MaNV
--         AND lsv1.ChiNhanh <> i.ChiNhanh
--         AND lsv1.NgayKetThuc > i.NgayBatDau
--     )
--     BEGIN
--         -- Nếu ngày kết thúc tại chi nhánh cũ không trước ngày bắt đầu tại chi nhánh mới
--         RAISERROR ('Ngày kết thúc phải trước ngày bắt đầu trong lịch sử làm việc của nhân viên', 16, 1);
--         ROLLBACK TRANSACTION; -- Hoàn tác giao dịch
--     END
-- END
-- GO
-- Cùng 1 thời điểm thì 1 nhân viên chỉ được làm việc tại 1 chi nhánh. ( Không có khoảng thời gian chồng chéo cho cùng 1 nhân viên trong bảng Lịch sử làm việc)

CREATE TRIGGER trg_CheckOverlap_WorkTime
ON lich_su_lam_viec
FOR INSERT, UPDATE
AS
BEGIN
    -- used for debugging
    -- SELECT i.MaNV ,lsv1.ChiNhanh,lsv1.NgayBatDau, lsv1.NgayKetThuc,i.ChiNhanh, i.NgayBatDau, i.NgayKetThuc
    --     FROM lich_su_lam_viec lsv1
    --     JOIN inserted i ON lsv1.MaNV = i.MaNV
    --     WHERE (
    --         (lsv1.MaNV = i.MaNV) 
    --         AND lsv1.ChiNhanh != i.ChiNhanh
    --         AND (
    --             (i.NgayBatDau BETWEEN lsv1.NgayBatDau AND lsv1.NgayKetThuc)
    --             OR (i.NgayKetThuc BETWEEN lsv1.NgayBatDau AND lsv1.NgayKetThuc)
    --             OR (lsv1.NgayBatDau BETWEEN i.NgayBatDau AND i.NgayKetThuc)
    --             OR (lsv1.NgayKetThuc BETWEEN i.NgayBatDau AND i.NgayKetThuc)
    --         )
    --     )
   
    -- Kiểm tra không có chồng chéo thời gian làm việc cho cùng 1 nhân viên tại các chi nhánh
    IF EXISTS (
        SELECT 1
        FROM lich_su_lam_viec lsv1
        JOIN inserted i ON lsv1.MaNV = i.MaNV
        WHERE (
            (lsv1.MaNV = i.MaNV) 
            AND lsv1.ChiNhanh != i.ChiNhanh
            AND (
                (i.NgayBatDau BETWEEN lsv1.NgayBatDau AND lsv1.NgayKetThuc)
                OR (i.NgayKetThuc BETWEEN lsv1.NgayBatDau AND lsv1.NgayKetThuc)
                OR (lsv1.NgayBatDau BETWEEN i.NgayBatDau AND i.NgayKetThuc)
                OR (lsv1.NgayKetThuc BETWEEN i.NgayBatDau AND i.NgayKetThuc)
            )
        )
    )
    BEGIN
        -- Nếu có thời gian chồng chéo, đưa ra thông báo lỗi
        RAISERROR ('Ngày kết thúc và bắt đầu của 1 nhân viên tại 2 chi nhánh khác nhau không được trùng lên nhau', 16, 1);
        ROLLBACK TRANSACTION; -- Hoàn tác giao dịch
    END
END
GO

--Nhân viên quản lý phải thuộc bộ phận quản lý
CREATE TRIGGER trg_Check_Employee_Manager_Department
ON chi_nhanh
FOR INSERT, UPDATE
AS
BEGIN
    -- Kiểm tra xem nhân viên quản lý có thuộc bộ phận quản lý không
    -- DECLARE @NVQuanLy CHAR(5);
    -- DECLARE @MaBoPhan NVARCHAR(5);

    -- Lấy mã nhân viên quản lý và mã bộ phận từ bảng inserted (dành cho các thao tác INSERT và UPDATE)
    -- SELECT @NVQuanLy = new.NVQuanLy FROM inserted new;

    -- Lấy mã bộ phận của nhân viên quản lý
    -- SELECT @MaBoPhan = nv.BoPhan FROM nhan_vien nv WHERE MaNV = @NVQuanLy;

    -- SELECT 1  
    -- FROM inserted new JOIN 
    -- nhan_vien nv ON new.NVQuanLy = nv.MaNV AND 
    --                 nv.BoPhan != 5
    -- Kiểm tra nếu bộ phận của nhân viên quản lý không phải bộ phận "quản lý" (Giả sử mã bộ phận quản lý là 'BP01')
    IF EXISTS(
        SELECT 1  
        FROM inserted new JOIN 
        nhan_vien nv ON new.NVQuanLy = nv.MaNV AND 
                        nv.BoPhan != 5
    ) 
    BEGIN
        -- Nếu không thuộc bộ phận quản lý, thông báo lỗi và hoàn tác giao dịch
        RAISERROR ('Nhân viên quản lý phải thuộc về bộ phận quản lý', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO
--Nhân viên quản lý phải đang làm việc tại chi nhánh đó trong thời gian hiện tại.
CREATE TRIGGER trg_Check_Manager_Working_Current
ON chi_nhanh
FOR INSERT, UPDATE
AS
BEGIN
    -- DECLARE @NVQuanLy CHAR(5);
    -- DECLARE @MaCN CHAR(5);
    -- DECLARE @NgayHienTai DATE;

    -- Lấy mã nhân viên quản lý và mã chi nhánh từ bảng inserted (dành cho các thao tác INSERT và UPDATE)
    -- SELECT @NVQuanLy = NVQuanLy, @MaCN = MaCN FROM inserted;
    
    -- Lấy ngày hiện tại
    -- SET @NgayHienTai = CONVERT(DATE, GETDATE());

    -- Kiểm tra xem nhân viên quản lý có đang làm việc tại chi nhánh đó trong ngày hiện tại không
    IF 0 < ALL(SELECT COUNT(*) FROM nhan_vien)
    BEGIN   

        -- SELECT new.MaCN, new.NVQuanLy, nv.ChiNhanh
        -- FROM inserted new JOIN
        --     nhan_vien nv ON new.NVQuanLy = nv.MaNV AND
        --                     new.MaCN != nv.ChiNhanh

        IF NOT EXISTS (SELECT 1 
                        FROM inserted new JOIN 
                        nhan_vien nv ON new.NVQuanLy = nv.MaNV)
        BEGIN
            RAISERROR ('Nhân viên quản lý không nằm trong danh sách nhân viên', 16, 1);
            ROLLBACK TRANSACTION;
        END


        IF EXISTS (
            SELECT 1
            FROM inserted new JOIN
                nhan_vien nv ON new.NVQuanLy = nv.MaNV AND
                                new.MaCN != nv.ChiNhanh
        )
        BEGIN
            -- Nếu nhân viên quản lý không đang làm việc tại chi nhánh trong thời gian hiện tại, đưa ra thông báo lỗi
            RAISERROR ('Nhân viên quản lý phải đang làm việc tại chi nhánh mình quản lý', 16, 1);
            ROLLBACK TRANSACTION; -- Hoàn tác giao dịch
        END
    END
END;
GO


CREATE TRIGGER ck_luong_nhan_vien
ON nhan_vien
AFTER INSERT, UPDATE 
AS
BEGIN
    if EXISTS( SELECT 1 
                FROM INSERTED new JOIN 
                bo_phan bp ON new.BoPhan = bp.MaBoPhan
                WHERE new.Luong < bp.MucLuong * 0.95 OR 
                        new.Luong > bp.MucLuong * 1.15)
    BEGIN
        RAISERROR ('Lương của nhân viên không được lớn hơn hoặc nhỏ hơn lương của bộ phận 15%',16,1);
        ROLLBACK TRANSACTION; 
    END

END;
GO

------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------NHÂN VIÊN----------------------------------------------------------

-- 5. Thêm thông tin nhân viên
CREATE OR ALTER PROCEDURE ThemNhanVien
	@MaNV CHAR(5),
    @TenNV NVARCHAR(50),
	@SoNha NVARCHAR(50),
	@Duong NVARCHAR(50),
	@Quan NVARCHAR(50),
	@ThanhPho NVARCHAR(50),
    @NgaySinh DATE,
    @GioiTinh NVARCHAR(3),
	@MaBoPhan INT,
    @MaChiNhanh INT
AS
BEGIN
    INSERT INTO nhan_vien (MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, NgaySinh, Phai, BoPhan, ChiNhanh)
    VALUES (@MaNV, @TenNV,@SoNha, @Duong, @Quan, @ThanhPho, @NgaySinh, @GioiTinh, @MaBoPhan, @MaChiNhanh);

	INSERT INTO lich_su_lam_viec (MaNV, ChiNhanh, NgayBatDau, NgayKetThuc)
        VALUES (@MaNV, @MaChiNhanh, getdate(), null);
END;
GO



﻿-- 4. Chuyển nhân sự
go
CREATE OR ALTER PROCEDURE ChuyenNhanSu
@MaNV CHAR(5),
@MaChiNhanhMoi INT,
@MaBoPhanMoi INT = NULL
AS
BEGIN
        UPDATE nhan_vien
        SET ChiNhanh = @MaChiNhanhMoi
        WHERE MaNV = @MaNV;

        IF @MaBoPhanMoi IS NOT NULL
        BEGIN
            UPDATE nhan_vien
            SET BoPhan = @MaBoPhanMoi
            WHERE MaNV = @MaNV;
        END;

		UPDATE lich_su_lam_viec
        SET NgayKetThuc = getdate()
        WHERE MaNV = @MaNV and NgayKetThuc = null;

		INSERT INTO lich_su_lam_viec (MaNV, ChiNhanh, NgayBatDau, NgayKetThuc)
        VALUES (@MaNV, @MaChiNhanhMoi, getdate(), null);

END;


-- xoá nhân viên
go
CREATE OR ALTER PROCEDURE xoa_nhan_vien
    @MaNV CHAR(5) 
AS
BEGIN
    UPDATE nhan_vien
    SET DangLamViec = 0 
    WHERE MaNV = @MaNV
END
go

--exec xoa_nhan_vien @MaNV = 'NV777'



------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------Món ăn----------------------------------------------------------


-- thêm món ăn trang admin/menu
CREATE OR ALTER PROCEDURE them_mon_an
    @MaMon   CHAR(5),
    @TenMon  NVARCHAR(50),
    @Gia     INT,
    @Loai    NVARCHAR(50)
AS
BEGIN
    INSERT INTO mon_an (MaMon,TenMon, Gia, Loai)
    VALUES
    (@MaMon, @TenMon, @Gia, @Loai)
END;


-- search mon an (theo mã món)
go
CREATE OR ALTER PROCEDURE tim_mon_an_ma_mon 
    @ma_mon CHAR(5)
AS
BEGIN
    SELECT * from mon_an mm
    WHERE mm.MaMon = @ma_mon
END;
go
-- search mon an (theo tên món)
CREATE OR ALTER PROCEDURE tim_mon_an_ten_mon
    @input_str NVARCHAR(50)
AS
BEGIN
    SELECT * from mon_an mm 
    WHERE (mm.TenMon) like N'%' + @input_str + N'%'
END;

-- xoá món ăn KHU VỰC + CHI NHÁNH
go
CREATE OR ALTER PROCEDURE xoa_mon_an
    @MaMon   CHAR(5)
AS
BEGIN
    DELETE FROM mon_an_khu_vuc
    WHERE MaMon = @MaMon

    DELETE FROM mon_an_chi_nhanh 
    WHERE MaMon = @MaMon
END;
go 

exec xoa_mon_an @MaMon = 'MM001'


-- xoá món ăn chi nhánh
go
CREATE OR ALTER PROCEDURE xoa_mon_an_chi_nhanh
    @MaCN     INT, 
    @MaMon    CHAR(5)
AS
BEGIN
    DELETE FROM mon_an_chi_nhanh 
    WHERE MaCN = @MaCN AND
            MaMon = @MaMon
END;
go 


-- xoá món ăn khu vực
CREATE OR ALTER PROCEDURE xoa_mon_an_khu_vuc
    @MaMon    CHAR(5),
    @MaKV     INT  
AS
BEGIN
    DELETE FROM mon_an_khu_vuc 
    WHERE MaKhuVuc = @MaKV AND
            MaMon = @MaMon
END;
go 



-------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------thẻ-------------------------------------------


-- thêm thẻ mới:
CREATE OR ALTER PROCEDURE TaoTheMoi
	@MaThe CHAR(5),
    @CCCD CHAR(12),       
    @LoaiThe VARCHAR(10),  
    @NhanVienLap CHAR(5)  
AS
BEGIN
    -- Kiểm tra xem CCCD có tồn tại trong bảng khach_hang không
    IF NOT EXISTS (SELECT 1 FROM khach_hang WHERE CCCD = @CCCD)
    BEGIN
        PRINT 'Khách hàng không tồn tại';
        RETURN;
    END

    -- Kiểm tra xem mã nhân viên có tồn tại trong bảng nhan_vien không (nếu có nhân viên)
    IF @NhanVienLap IS NOT NULL AND NOT EXISTS (SELECT 1 FROM nhan_vien WHERE MaNV = @NhanVienLap)
    BEGIN
        PRINT 'Mã nhân viên không hợp lệ';
        RETURN;
    END

    -- Thêm thông tin vào bảng the
    INSERT INTO the (MaThe, CCCD, NgayLap, LoaiThe, NhanVienLap, CapNhat)
    VALUES (@MaThe, @CCCD, GETDATE(), @LoaiThe, @NhanVienLap, GETDATE());
    
    SELECT @MaThe AS MaTheMoi;
END
GO

-- test
 --EXEC TaoTheMoi @MaThe = 'MT111', @CCCD = '123456789012', @LoaiThe = 'VIP', @NhanVienLap = 'NV001';
 ------------------------------------------------------------------------------------------------------------------------
 ------------------------------------------------------------------------------------------------------------------------
 -- thêm thuộc tính cho chi_nhanh
-- ALTER TABLE chi_nhanh
--ADD DangHoatDong BIT NOT NULL DEFAULT 1;

-- XOÁ TẠM trigger này------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------
--drop trigger ck_luong_nhan_vien

-------------------------------------DUY BẮC THỐNG KÊ------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE xem_doanh_thu_chi_nhanh
    @MaCN INT,      -- Mã chi nhánh
    @Ngay1 DATE,      -- Ngày cần xem doanh thu
    @Ngay2 DATE      -- Ngày cần xem doanh thu
AS
BEGIN
    -- Tính tổng doanh thu sau khi cập nhật bảng hoa_don
    SELECT pd.MaCN AS MaChiNhanh,
        pd.NgayDat AS Ngay, 
        SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    WHERE pd.MaCN = @MaCN AND pd.NgayDat >= @Ngay1 AND pd.NgayDat <= @Ngay2
    GROUP BY pd.MaCN, pd.NgayDat
END;
GO

-- EXEC xem_doanh_thu_chi_nhanh @MaCN = 1, @Ngay1 = '02/15/2024', @Ngay2 = '04/12/2024'

-- SELECT * FROM hoa_don;

GO
CREATE OR ALTER PROCEDURE xem_doanh_thu_chi_nhanh_thang
    @MaCN INT,      -- Mã chi nhánh
    @Ngay1 DATE,      -- Ngày cần xem doanh thu
    @Ngay2 DATE      -- Ngày cần xem doanh thu
AS
BEGIN

    -- Tính tổng doanh thu sau khi cập nhật bảng hoa_don
    SELECT 
        pd.MaCN AS MaChiNhanh,
        CONCAT(MONTH(pd.NgayDat),'/', YEAR(pd.NgayDat)) AS Thang,
        SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    WHERE 
        pd.MaCN = @MaCN AND
        DATEDIFF(MONTH, pd.NgayDat, @Ngay1) <= 0 AND 
        DATEDIFF(MONTH, pd.NgayDat, @Ngay2) >= 0
    GROUP BY MONTH(pd.NgayDat), YEAR(pd.NgayDat), pd.MaCN;  
END;
GO

-- EXEC xem_doanh_thu_chi_nhanh @MaCN = 1, @Ngay1 = '02/15/2024', @Ngay2 = '04/12/2024'
-- EXEC xem_doanh_thu_chi_nhanh_thang @MaCN = 1, @Ngay1 = '02/15/2024', @Ngay2 = '04/12/2024'

GO
CREATE OR ALTER PROCEDURE xem_doanh_thu_chi_nhanh_quy
    @MaCN INT,      -- Mã chi nhánh
    @Ngay1 DATE,      -- Ngày cần xem doanh thu
    @Ngay2 DATE      -- Ngày cần xem doanh thu
AS
BEGIN
    -- Tính tổng doanh thu sau khi cập nhật bảng hoa_don
    SELECT 
        pd.MaCN AS MaChiNhanh,
        CONCAT('Q',DATEPART(QUARTER, pd.NgayDat),' ', YEAR(pd.NgayDat)) AS Quy,
        SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    WHERE 
        pd.MaCN = @MaCN AND
        DATEDIFF(YEAR, pd.NgayDat, @Ngay1) <= 0 AND 
        DATEDIFF(YEAR, pd.NgayDat, @Ngay2) >= 0
    GROUP BY 
        DATEPART(QUARTER, pd.NgayDat),
        YEAR(pd.NgayDat),
        pd.MaCN;
END;
GO

-- EXEC xem_doanh_thu_chi_nhanh_quy @MaCN = 1, @Ngay1 = '02/15/2024', @Ngay2 = '04/12/2024'

CREATE OR ALTER PROCEDURE xem_doanh_thu_chi_nhanh_nam
    @MaCN INT,      -- Mã chi nhánh
    @Ngay1 DATE,      -- Ngày cần xem doanh thu
    @Ngay2 DATE      -- Ngày cần xem doanh thu
AS
BEGIN

    -- Tính tổng doanh thu sau khi cập nhật bảng hoa_don
    SELECT 
        pd.MaCN AS MaChiNhanh,
        YEAR(pd.NgayDat) AS Nam,
        SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    WHERE 
        pd.MaCN = @MaCN AND
        DATEDIFF(YEAR, pd.NgayDat, @Ngay1) <= 0 AND 
        DATEDIFF(YEAR, pd.NgayDat, @Ngay2) >= 0
    GROUP BY YEAR(pd.NgayDat), pd.MaCN;  
END;
GO

--Test
--exec xem_doanh_thu_chi_nhanh_nam 1, 2024

--------------------------------------------------------------------------------------------------

-- Viết truy vấn xem doanh thu theo ngày của nhiều chi nhánh
GO
CREATE OR ALTER PROCEDURE xem_doanh_thu_nhieu_chi_nhanh_ngay
    @MaCN NVARCHAR(100), -- Danh sách mã chi nhánh, phân tách bằng dấu phẩy
    @Ngay DATE           -- Ngày cần xem doanh thu
AS
BEGIN
    -- Tách danh sách mã chi nhánh thành các giá trị riêng lẻ
    WITH DSChiNhanh AS
    (
        SELECT value AS MaChiNhanh FROM STRING_SPLIT(@MaCN, ',')
    )
    SELECT MaChiNhanh INTO #TempChiNhanh FROM DSChiNhanh;

    -- Tính tổng doanh thu
    SELECT pd.MaCN, SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    JOIN #TempChiNhanh cn ON pd.MaCN = cn.MaChiNhanh
    WHERE pd.NgayDat = @Ngay
    GROUP BY pd.MaCN;

    -- Xóa bảng tạm
    DROP TABLE #TempChiNhanh;
END;
GO
--Test
--exec xem_doanh_thu_nhieu_chi_nhanh_ngay '1,2', '2024-04-18'

--------------------------------------------------------------------------------------------------

-- Viết truy vấn xem doanh thu theo tháng của nhiều chi nhánh
GO
CREATE OR ALTER PROCEDURE xem_doanh_thu_nhieu_chi_nhanh_thang
    @MaCN NVARCHAR(100), -- Danh sách mã chi nhánh, phân tách bằng dấu phẩy
    @Thang INT,          -- Tháng cần xem doanh thu
    @Nam INT             -- Năm cần xem doanh thu
AS
BEGIN
    -- Tách danh sách mã chi nhánh thành các giá trị riêng lẻ và chuyển sang kiểu INT
    WITH DSChiNhanh AS
    (
        SELECT CAST(value AS INT) AS MaChiNhanh
        FROM STRING_SPLIT(@MaCN, ',')
    )
    -- Lưu kết quả từ CTE vào bảng tạm
    SELECT MaChiNhanh INTO #TempChiNhanh FROM DSChiNhanh;

    -- Tính tổng doanh thu sau khi cập nhật bảng hoa_don
    SELECT pd.MaCN, SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    JOIN #TempChiNhanh cn ON pd.MaCN = cn.MaChiNhanh
    WHERE MONTH(pd.NgayDat) = @Thang AND YEAR(pd.NgayDat) = @Nam
    GROUP BY pd.MaCN;

    -- Xóa bảng tạm sau khi sử dụng
    DROP TABLE #TempChiNhanh;
END;
GO
--Test
--exec xem_doanh_thu_nhieu_chi_nhanh_thang '1,5', 3, 2024

--------------------------------------------------------------------------------------------------

-- Viết truy vấn xem doanh thu theo quý của nhiều chi nhánh
go
CREATE OR ALTER PROCEDURE xem_doanh_thu_nhieu_chi_nhanh_quy
    @MaCN NVARCHAR(100), -- Danh sách mã chi nhánh, phân tách bằng dấu phẩy
    @Quy INT,            -- Số quý
    @Nam INT             -- Năm
AS
BEGIN
    -- Tách danh sách mã chi nhánh thành các giá trị riêng lẻ và lưu vào bảng tạm
    WITH DSChiNhanh AS
    (
        SELECT CAST(value AS INT) AS MaChiNhanh
        FROM STRING_SPLIT(@MaCN, ',')
    )
    SELECT MaChiNhanh INTO #TempChiNhanh FROM DSChiNhanh; -- Lưu kết quả vào bảng tạm


    -- Tính tổng doanh thu sau khi cập nhật bảng hoa_don
    SELECT pd.MaCN, SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    JOIN #TempChiNhanh cn ON pd.MaCN = cn.MaChiNhanh
    WHERE DATEPART(QUARTER, pd.NgayDat) = @Quy AND YEAR(pd.NgayDat) = @Nam
    GROUP BY pd.MaCN;

    -- Dọn dẹp bảng tạm
    DROP TABLE #TempChiNhanh;
END;
GO
--Test
--exec xem_doanh_thu_nhieu_chi_nhanh_quy '2,6', 2, 2024

--------------------------------------------------------------------------------------------------

-- Viết truy vấn xem doanh thu theo năm của nhiều chi nhánh
GO
CREATE OR ALTER PROCEDURE xem_doanh_thu_nhieu_chi_nhanh_nam
    @MaCN NVARCHAR(100), -- Danh sách mã chi nhánh, phân tách bằng dấu phẩy
    @Nam INT             -- Năm cần xem doanh thu
AS
BEGIN
    -- Tách danh sách mã chi nhánh thành các giá trị riêng lẻ và lưu vào bảng tạm
    WITH DSChiNhanh AS
    (
        SELECT CAST(value AS INT) AS MaChiNhanh
        FROM STRING_SPLIT(@MaCN, ',')
    )
    SELECT MaChiNhanh INTO #TempChiNhanh FROM DSChiNhanh; -- Lưu kết quả vào bảng tạm

    -- Tính tổng doanh thu sau khi cập nhật bảng hoa_don
    SELECT pd.MaCN, SUM(hd.ThanhTien) AS DoanhThu
    FROM hoa_don hd
    JOIN phieu_dat pd ON hd.MaPhieu = pd.MaPhieu
    JOIN #TempChiNhanh cn ON pd.MaCN = cn.MaChiNhanh
    WHERE YEAR(pd.NgayDat) = @Nam
    GROUP BY pd.MaCN;

    -- Dọn dẹp bảng tạm
    DROP TABLE #TempChiNhanh;
END;
GO
--Test
--exec xem_doanh_thu_nhieu_chi_nhanh_nam '1,2,3', 2024

    
