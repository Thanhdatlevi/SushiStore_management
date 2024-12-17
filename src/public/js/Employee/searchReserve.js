const userID = sessionStorage.getItem('userID');
async function fetchStatistics() {
    try {
        const queryParams = new URLSearchParams({ userID: userID }).toString();
        const response = await fetch(`/employee/reserve/statisticsByBranch?${queryParams}`);
        if (!response.ok) throw new Error('Lỗi khi tải thống kê.');
        const stats = await response.json();

        const statsContainer = document.getElementById('stats-container');

        // Xóa nội dung cũ
        statsContainer.innerHTML = '';

        // Món bán chạy nhất
        statsContainer.innerHTML += `
            <div class="bg-white p-4 rounded shadow mb-4">
                <h2 class="text-lg font-bold">Món Bán Chạy Nhất</h2>
                ${stats.BanChay.map(row => `
                <p>Mã món: ${row.TenMon}</p>
                <p class="mb-2">Số lượng: ${row.SoLuong} món</p>
                `).join('')}
            </div>
        `;

        // Món bán chậm nhất
        statsContainer.innerHTML += `
            <div class="bg-white p-4 rounded shadow">
                <h2 class="text-lg font-bold mb-2">Món Bán Chậm Nhất</h2>
                ${stats.BanCham.map(row => `
                <p>Mã món: ${row.TenMon}</p>
                <p class="mb-2">Số lượng: ${row.SoLuong} món</p>
                `).join('')}
            </div>
        `;

        statsContainer.innerHTML += `
            <div class="bg-white p-4 rounded shadow">
                <h2 class="text-lg font-bold mb-2">Số lượng Phiếu Đặt</h2>
                ${stats.SoLuongPhieu.map(row => `
                    <p>Loại ${row.LoaiPhieu}: ${row.SoLuongPhieu}</p>
                `).join('')}
            </div>
        `;

        // Doanh thu chi nhánh
        statsContainer.innerHTML += `
            <div class="bg-white p-4 rounded shadow">
                <h2 class="text-lg font-bold mb-2">Doanh Thu</h2>
                ${stats.DoanhThu.map(row => `
                    <p class="mb-2">Doanh thu: ${row.TongDoanhThu} VND</p>
                `).join('')}
            </div>
        `;

        // Thêm thống kê món ăn
        statsContainer.innerHTML += `
            <div class="p-4 rounded shadow mb-4">
                <h2 class="text-lg font-bold mb-2">Số lượng Món Ăn</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                ${stats.SoLuongMon.map(row => `
                    <div class="mb-4">
                            <p>Món ăn: ${row.MonAn}</p>
                            <p>Số lượng:  ${row.SoLuong} món</p>
                            <p>Doanh Thu: ${row.DoanhThu} VND</p>
                    </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error(error);
        alert('Không thể tải dữ liệu thống kê.');
    }
}

// Gọi hàm khi trang được tải
fetchStatistics();