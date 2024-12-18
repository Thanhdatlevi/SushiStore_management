--use master
--go
--ALTER DATABASE [SushiStore_management] SET SINGLE_USER WITH ROLLBACK IMMEDIATE

--DROP DATABASE [SushiStore_management]
--GO

--CREATE DATABASE SushiStore_management
--GO

--USE SushiStore_management
--GO
-- 1. cài đặt bảng
-- KhachHang
CREATE TABLE khach_hang
(
    CCCD  CHAR(12) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    SDT   CHAR(10) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Phai  NVARCHAR(3),
    PRIMARY KEY(CCCD),
    CONSTRAINT ck_khach_hang_phai CHECK (Phai in (N'Nam', N'Nu'))

)
GO
-- 2. cai dat khoa ngoai
-- -- the
CREATE TABLE khu_vuc
(
    MaKhuVuc  INT IDENTITY(1,1) PRIMARY KEY,
    TenKhuVuc NVARCHAR(50) NOT NULL
);
go

CREATE TABLE bo_phan
(
    MaBoPhan  INT IDENTITY(1,1) PRIMARY KEY,
    TenBoPhan NVARCHAR(50) NOT NULL,
    MucLuong  FLOAT NOT NULL CHECK (MucLuong > 0)
);
go

CREATE TABLE chi_nhanh
(
    MaCN     INT IDENTITY(1,1) PRIMARY KEY,
    TenCN    NVARCHAR(50) NOT NULL,
    DiaChi   NVARCHAR(100) NOT NULL,
    GioMo    TIME NOT NULL,
    GioDong  TIME NOT NULL,
    SDT      NVARCHAR(15) NOT NULL,
    GiaoHang BIT NOT NULL,
    XeMay    BIT NOT NULL,
    XeHoi    BIT NOT NULL,
    NVQuanLy CHAR(5) NOT NULL DEFAULT '', -- Khóa ngoại vòng tròn 
    MaKhuVuc INT NOT NULL,
);
go

ALTER TABLE chi_nhanh ADD CONSTRAINT FK_chinhanh_khuvuc FOREIGN KEY(MaKhuVuc) REFERENCES khu_vuc(MaKhuVuc);
go

CREATE TABLE nhan_vien
(
    MaNV     CHAR(5) PRIMARY KEY,
    HoTen    NVARCHAR(50) NOT NULL,
    SoNha    NVARCHAR(50) NOT NULL,
    Duong    NVARCHAR(50) NOT NULL,
    Quan     NVARCHAR(50) NOT NULL,
    ThanhPho NVARCHAR(50) NOT NULL,
    NgaySinh DATE NOT NULL CHECK (DATEDIFF(year, NgaySinh, getdate()) >= 15),
    Phai     NVARCHAR(3) NOT NULL CHECK (Phai IN ('Nam', 'Nu')),
    BoPhan   INT NOT NULL,
    ChiNhanh INT NOT NULL,
    Luong INT NULL,  
    DangLamViec BIT DEFAULT 1,
);
go


ALTER TABLE nhan_vien ADD 
CONSTRAINT FK_nhanvien_bophan 
FOREIGN KEY(BoPhan) REFERENCES bo_phan(MaBoPhan);

ALTER TABLE nhan_vien ADD 
CONSTRAINT FK_nhanvien_chinhanh 
FOREIGN KEY(ChiNhanh) REFERENCES chi_nhanh(MaCN);
-- -- Bang chi nhanh phai chieu khoa ngoai toi nhan vien sau 
-- ALTER TABLE chi_nhanh ADD CONSTRAINT FK_chinhanh_nhanvien FOREIGN KEY(NVQuanLy)
-- REFERENCES nhan_vien(MaNV);
go
CREATE TABLE lich_su_lam_viec
(
    MaNV        CHAR(5),
    ChiNhanh    INT,
    NgayBatDau  DATE NOT NULL,
    NgayKetThuc DATE,
    PRIMARY KEY(MaNV, ChiNhanh, NgayBatDau),

    CONSTRAINT CK_NgayBatDau_NgayKetThuc CHECK (NgayBatDau < NgayKetThuc OR NgayKetThuc = NULL), 

    CONSTRAINT FK_lich_su_lam_viec_nhan_vien_MaNV 
    FOREIGN KEY (MaNV) REFERENCES nhan_vien (MaNV)
    ON DELETE CASCADE,

    CONSTRAINT FK_lich_su_lam_viec_chi_nhanh_MaCN 
    FOREIGN KEY (ChiNhanh) REFERENCES chi_nhanh (MaCN),
);
go
CREATE TABLE dien_thoai_nhan_vien
(
    MaNV      CHAR(5),
    DienThoai NVARCHAR(11) UNIQUE,
    PRIMARY KEY (MaNV, DienThoai),

    CONSTRAINT FK_dien_thoai_nhan_vien_nhan_vien_MaNV 
    FOREIGN KEY (MaNV) REFERENCES nhan_vien (MaNV)
    ON DELETE CASCADE,
);
go
CREATE TABLE mon_an
(
    MaMon   CHAR(5) PRIMARY KEY,
    TenMon  NVARCHAR(50) NOT NULL,
    Gia     INT NOT NULL,
    Loai    NVARCHAR(50) NOT NULL,
    CONSTRAINT CK_Gia CHECK (Gia > 0),
);
go

CREATE TABLE mon_an_khu_vuc
(
    MaKhuVuc INT,
    MaMon    CHAR(5),
    PRIMARY KEY (MaKhuVuc, MaMon),
    CONSTRAINT FK_mon_an_khu_vuc_khu_vuc_MaKhuVuc FOREIGN KEY (MaKhuVuc) REFERENCES khu_vuc (MaKhuVuc),

    CONSTRAINT FK_mon_an_khu_vuc_mon_an_MaMon 
    FOREIGN KEY (MaMon) REFERENCES mon_an (MaMon)
    ON DELETE NO ACTION,
);
go

CREATE TABLE mon_an_chi_nhanh
(
    MaCN     INT,
    MaMon    CHAR(5),
    GiaoHang BIT NOT NULL,
    PRIMARY KEY (MaCN, MaMon),
    CONSTRAINT FK_mon_an_chi_nhanh_chi_nhanh_MaCN FOREIGN KEY (MaCN) REFERENCES chi_nhanh (MaCN),

    CONSTRAINT FK_mon_an_chi_nhanh_mon_an_MaMon 
    FOREIGN KEY (MaMon) REFERENCES mon_an (MaMon)
    ON DELETE NO ACTION, 
);
go


-- use SushiStore_management
-- go
-- bảng mon_an_khu_vuc
-- bảng order
CREATE TABLE phieu_dat
(
    MaPhieu     CHAR(5) PRIMARY KEY,
    NgayDat     DATE NOT NULL,
    MaCN        INT NOT NULL,
    NhanVienLap CHAR(5) NULL,
    CCCD        CHAR(12) NOT NULL,
    LoaiPhieu   INT NOT NULL,
-- CONSTRAINT CK_NgayDat CHECK (NgayDat >= GETDATE()),
    CONSTRAINT FK_order_nhan_vien_NhanVienLap 
    FOREIGN KEY (NhanVienLap) 
    REFERENCES nhan_vien (MaNV)
    ON DELETE SET NULL,
    CONSTRAINT FK_order_chi_nhanh_MaCN FOREIGN KEY (MaCN) REFERENCES chi_nhanh (MaCN),
    CONSTRAINT FK_order_khach_hang_NhanVienLap FOREIGN KEY (CCCD) REFERENCES khach_hang (CCCD),
    CONSTRAINT CK_order_LoaiPhieu CHECK (LoaiPhieu IN (1,2,3)),
); 
go
-- bảng order_tai_cho
CREATE TABLE order_tai_cho
(
    MaPhieu char(5) primary key,
    SoBan int not null,
    CONSTRAINT FK_order_tai_cho_order_MaPhieu FOREIGN KEY (MaPhieu) REFERENCES phieu_dat (MaPhieu),
);
go
-- bảng dat_ban_online
CREATE TABLE dat_ban_online
(
    MaPhieu      CHAR(5) PRIMARY KEY,
    KhuVuc       INT NOT NULL,
    SoLuongKhach INT NOT NULL,
    GioDen       TIME NOT NULL,
    GhiChu       NVARCHAR(100),
    CONSTRAINT CK_SoLuongKhach                  CHECK (SoLuongKhach > 0),
    constraint CK_GioDen                        CHECK (GioDen between '00:00:00' and '23:59:59'),
    CONSTRAINT FK_dat_ban_online_order_MaPhieu  FOREIGN KEY (MaPhieu) REFERENCES phieu_dat (MaPhieu),
    CONSTRAINT FK_dat_ban_online_khu_vuc_KhuVuc FOREIGN KEY (KhuVuc) REFERENCES khu_vuc (MaKhuVuc),
);

CREATE TABLE giao_hang
(
    MaPhieu        CHAR(5) PRIMARY KEY,
    ThoiDiemOnline TIME NOT NULL,
    ThoiGianOnline TIME NOT NULL,
    CONSTRAINT FK_giao_hang_order_MaPhieu FOREIGN KEY (MaPhieu) REFERENCES phieu_dat (MaPhieu),
    CONSTRAINT CK_ThoiGianOnline CHECK (ThoiGianOnline > '00:00:00')
); 
go
CREATE TABLE ma_mon_phieu_dat
(
    MaPhieu  CHAR(5),
    MaMon    CHAR(5),
    SoLuong  INT NOT NULL,
    DatTruoc BIT NOT NULL DEFAULT (0),
    CONSTRAINT FK_ma_mon_phieu_dat_order_MaPhieu FOREIGN KEY (MaPhieu) REFERENCES phieu_dat (MaPhieu),

    CONSTRAINT FK_ma_mon_phieu_dat_mon_an_MaMon 
    FOREIGN KEY (MaMon) REFERENCES mon_an (MaMon)
    ON DELETE NO ACTION,

    CONSTRAINT CK_SoLuong CHECK (SoLuong >= 0),
    PRIMARY KEY (MaPhieu, MaMon),
);
go


CREATE TABLE hoa_don (
        MaPhieu CHAR(5) PRIMARY KEY,
        TongTien INT NOT NULL,
        GiamGia FLOAT (24) NOT NULL,
        ThanhTien INT NOT NULL,
        DiemTichLuy INT NOT NULL,
        CONSTRAINT FK_hoa_don_order_MaPhieu FOREIGN KEY (MaPhieu) REFERENCES phieu_dat (MaPhieu),
        CONSTRAINT CK_GiamGia CHECK (GiamGia >= 0),
        CONSTRAINT CK_TongTien_ThanhTien CHECK (ThanhTien <= TongTien)
);
go

-- the
CREATE TABLE the
(
    MaThe       CHAR(5) NOT NULL,
    CCCD        CHAR(12) NOT NULL,
    NgayLap     DATETIME NOT NULL,
    LoaiThe     VARCHAR(10) NOT NULL,
    TieuDung    FLOAT(24) DEFAULT(0),
    NhanVienLap CHAR(5) NULL,
    CapNhat     DATETIME,

    PRIMARY KEY(MaThe),
    CONSTRAINT FK_the_khachHang_CCCD FOREIGN KEY (CCCD) REFERENCES khach_hang(CCCD),

    CONSTRAINT FK_the_nhanVien_NhanVienLap 
    FOREIGN KEY (NhanVienLap) REFERENCES nhan_vien(MaNV)
    ON DELETE SET NULL,
)
GO

-- chuong trinh
CREATE TABLE chuong_trinh
(
    MaChuongTrinh INT IDENTITY(1,1) NOT NULL,
    NgayBD DATETIME NOT NULL,
    NgayKT DATETIME NOT NULL,
    PRIMARY KEY(MaChuongTrinh),
    CONSTRAINT ck_chuong_trinh_date CHECK (NgayBD < NgayKT)
)
GO

-- giam gia
CREATE TABLE giam_gia
(
    MaChuongTrinh  INT NOT NULL,
    LoaiThe        VARCHAR(10) NOT NULL,
    UuDaiChietKhau FLOAT(24) NOT NULL,
    GiamGia        FLOAT(24) NOT NULL,
    TangSP         NVARCHAR(50),
    PRIMARY KEY(MaChuongTrinh, LoaiThe),
    CONSTRAINT FK_giamGia_chuongTrinh_MaChuongTrinh
    FOREIGN KEY (MaChuongTrinh) REFERENCES chuong_trinh(MaChuongTrinh),
)
GO

-- tham gia chuong trinh
CREATE TABLE tham_gia_chuong_trinh
(
    MaPhieu CHAR(5) NOT NULL,
    MaChuongTrinh INT NOT NULL,
    PRIMARY KEY(MaPhieu, MaChuongTrinh),
    CONSTRAINT FK_thamGiaChuongTrinh_chuongTrinh_MaChuongTrinh
    FOREIGN KEY (MaChuongTrinh) REFERENCES chuong_trinh(MaChuongTrinh),
    CONSTRAINT FK_thamGiaChuongTrinh_hoaDon_MaPhieu
    FOREIGN KEY (MaPhieu) REFERENCES phieu_dat(MaPhieu),
)
GO

CREATE TABLE danh_gia
(
    MaPhieu CHAR(5) PRIMARY KEY,
    DiemPhucVu INT NOT NULL,
    DiemViTri INT NOT NULL,
    DiemChatLuong INT NOT NULL,
    DiemGiaCa INT NOT NULL,
    DiemKhongGian INT NOT NULL,
    BinhLuan NVARCHAR (100),
    CONSTRAINT FK_danh_gia_order_MaPhieu 
        FOREIGN KEY (MaPhieu) REFERENCES phieu_dat (MaPhieu),
    CONSTRAINT CK_DiemPhucVu CHECK (
            DiemPhucVu >= 0
        AND DiemPhucVu <= 10
        ),
    CONSTRAINT CK_DiemViTri CHECK (
            DiemViTri >= 0
        AND DiemViTri <= 10
        ),
    CONSTRAINT CK_DiemChatLuong CHECK (
            DiemChatLuong >= 0
        AND DiemChatLuong <= 10
        ),
    CONSTRAINT CK_DiemGiaCa CHECK (
            DiemGiaCa >= 0
        AND DiemGiaCa <= 10
        ),
    CONSTRAINT CK_DiemKhongGian CHECK (
            DiemKhongGian >= 0
        AND DiemKhongGian <= 10
        )
);
go

CREATE TABLE account(
    userID INT IDENTITY(1,1) PRIMARY KEY, 
    accUserName VARCHAR(50) UNIQUE,
    accPassword VARCHAR(50),
    userType INT, 
    CONSTRAINT ck_account_type CHECK (userType in (0,1,2,3,4))
);
go


create function calc_bill(@maphieu char(5))
returns table
as
    return
    (
        select sum(mon.gia * mmpd.soluong) as tongtien
        from ma_mon_phieu_dat mmpd
        join mon_an mon on mmpd.mamon = mon.mamon
        where mmpd.maphieu = @maphieu
    )
;
go

create function tong_giam_gia(@maphieu char(5))
returns table
as
    return
    (
        select tgct.maphieu, sum(gg.giamgia) as giamgia
        from tham_gia_chuong_trinh tgct
        join chuong_trinh ct on ct.machuongtrinh = tgct.machuongtrinh
        join phieu_dat o on o.maphieu = @maphieu
        join the t on t.cccd = o.cccd
        join
            giam_gia gg
            on gg.machuongtrinh = ct.machuongtrinh
            and gg.loaithe = t.loaithe
        where tgct.maphieu = @maphieu
        group by (tgct.maphieu)
    )
;
go

CREATE PROCEDURE calc_hoa_don(@MaPhieu CHAR(5))
AS
BEGIN

    INSERT INTO hoa_don (MaPhieu, TongTien, GiamGia, ThanhTien, DiemTichLuy)
    SELECT @MaPhieu AS MaPhieu,
            bill.tongtien AS TongTien, 
            bill.tongtien * tgg.giamgia AS GiamGia, 
            bill.tongtien * (1 - tgg.giamgia / 100) AS ThanhTien, 
            CAST((bill.tongtien * (1 - tgg.giamgia / 100) / 10000) AS INT) AS DiemTichLuy
    FROM calc_bill(@MaPhieu) AS bill JOIN 
          tong_giam_gia(@MaPhieu) AS tgg ON tgg.MaPhieu = @MaPhieu 
    
    SELECT * FROM hoa_don h WHERE
    h.MaPhieu = @MaPhieu

    DECLARE @cccd_khach_hang CHAR(12)
    DECLARE @DiemTichLuy FLOAT(24)

    SELECT @cccd_khach_hang = t.CCCD 
    FROM the t JOIN 
    phieu_dat o ON t.CCCD = o.CCCD 
    WHERE o.MaPhieu = @MaPhieu

    SELECT @DiemTichLuy = h.DiemTichLuy 
    FROM hoa_don h 
    WHERE h.MaPhieu = @MaPhieu

    UPDATE the
    SET TieuDung = TieuDung + @DiemTichLuy
    WHERE CCCD = @cccd_khach_hang
END;
go


----
--set up luong mac dinh cho nhanv ien
drop trigger trg_setUpLuongNVDefault
create trigger trg_setUpLuongNVDefault
on nhan_vien
after insert
as
begin
	update nv
	set nv.Luong = bp.MucLuong
	from nhan_vien nv join bo_phan bp
	on nv.BoPhan =  bp.MaBoPhan
	join inserted i on i.MaNV = nv.MaNV 
end

-- test
--INSERT INTO nhan_vien(MaNV, HoTen, SoNha, Duong, Quan, ThanhPho, NgaySinh, Phai, BoPhan, ChiNhanh) VALUES
--(N'NV101', N'Nguyen Van 111', N'111 Le Lai', N'Le Lai', N'Quan 111', N'TP HCM', N'1990-05-15', N'Nam', N'1', N'1')


-- update luong nhan vien
go
create or alter procedure proc_updateLuongNhanVien
	@MaNV char(5), @luongMoi int
as
begin
	declare @luongHienTai int, @maBP int;
	
	-- lấy lương hiện tại và mã bộ phận
	select @luongHienTai = nv.Luong, @maBP = nv.BoPhan
	from nhan_vien nv
	where nv.MaNV = @MaNV;

	-- nếu lương mới khác lương hiện tại --> update
	if @luongMoi != @luongHienTai
		begin 
			update nhan_vien 
			set Luong = @luongMoi
			where MaNV = @MaNV
		end

end

-- test
--update nhan_vien
--set Luong = 9100000
--where MaNV = 'NV101'	

