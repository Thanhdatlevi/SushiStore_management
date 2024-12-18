
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
