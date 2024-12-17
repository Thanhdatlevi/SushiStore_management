document.addEventListener("DOMContentLoaded", function () {
    const foodHistoryTab = document.getElementById("foodHistoryTab");
    const tableHistoryTab = document.getElementById("tableHistoryTab");
    const foodHistory = document.getElementById("foodHistory");
    const tableHistory = document.getElementById("tableHistory");

    // Switch between Food History and Table History
    foodHistoryTab.addEventListener("click", () => {
        foodHistory.classList.remove("hidden");
        tableHistory.classList.add("hidden");
        foodHistoryTab.classList.add("bg-blue-500", "text-white");
        foodHistoryTab.classList.remove("bg-gray-300", "text-gray-700");
        tableHistoryTab.classList.add("bg-gray-300", "text-gray-700");
        tableHistoryTab.classList.remove("bg-blue-500", "text-white");
    });

    tableHistoryTab.addEventListener("click", () => {
        tableHistory.classList.remove("hidden");
        foodHistory.classList.add("hidden");
        tableHistoryTab.classList.add("bg-blue-500", "text-white");
        tableHistoryTab.classList.remove("bg-gray-300", "text-gray-700");
        foodHistoryTab.classList.add("bg-gray-300", "text-gray-700");
        foodHistoryTab.classList.remove("bg-blue-500", "text-white");
    });

    // Lấy userID từ sessionStorage
    const userID = sessionStorage.getItem('userID');

    // Fetch lịch sử đặt món ăn
    async function getReserveDish() {
        try {
            const response = await fetch(`/Customer/reserve/getReserveDish/${userID}`);
            const reserveDish = await response.json();
            reserveDish.forEach(dish => {
                dish.DanhSachMonAn = JSON.parse(dish.DanhSachMonAn);
            });
            // Render danh sách món ăn
            const foodHistoryContent = reserveDish.map(dish => {
                return `
                    <div class="bg-white p-4 rounded-md shadow-md">
                        <h3 class="font-semibold text-lg text-gray-800">Chi Nhánh: <span class="text-blue-500">${dish.TenCN}</span></h3>
                        <p class="text-gray-600">Ngày Đặt: ${dish.NgayDat}</p>
                        <ul class="mt-2 space-y-2">
                            ${dish.DanhSachMonAn.map(item => {
                                return `<li class="flex justify-between text-gray-700">
                                    <span>${item.TenMon}</span>
                                    <span>Số lượng: ${item.SoLuong}</span>
                                </li>`;
                            }).join('')}
                        </ul>
                    </div>
                `;
            }).join('');
            foodHistory.innerHTML = foodHistoryContent;
        } catch (error) {
            console.error('Error fetching reserve dish:', error);
        }
    }

    // Fetch lịch sử đặt bàn
    async function getReserveTable() {
        try {
            const response = await fetch(`/Customer/reserve/getReserveTable/${userID}`);
            const reserveTable = await response.json();
            reserveTable.forEach(dish => {
                dish.DanhSachMonAn = JSON.parse(dish.DanhSachMonAn);
            });
            // Render danh sách đặt bàn
            const tableHistoryContent = reserveTable.map(table => {
                return `
                    <div class="bg-white p-4 rounded-md shadow-md">
                        <h3 class="font-semibold text-lg text-gray-800">Chi Nhánh: <span class="text-blue-500">${table.TenCN}</span></h3>
                        <p class="text-gray-600">Ngày Đặt: ${table.NgayDat}</p>
                        <p class="text-gray-700">Số lượng khách: ${table.SoLuongKhach}</p>
                        <p class="text-gray-700">Giờ đến: ${table.GioDen}</p>
                        <p class="text-gray-700">Ghi chú: ${table.GhiChu}</p>
                        <p class="text-gray-700">Món đặt trước</p>
                        <ul class="mt-2 space-y-2">
                            ${table.DanhSachMonAn.map(item => {
                                return `<li class="flex justify-between text-gray-700">
                                    <span>${item.TenMon}</span>
                                    <span>Số lượng: ${item.SoLuong}</span>
                                </li>`;
                            }).join('')}
                        </ul>
                    </div>
                `;
            }).join('');
            tableHistory.innerHTML = tableHistoryContent;
        } catch (error) {
            console.error('Error fetching reserve table:', error);
        }
    }

    // Gọi các hàm để lấy dữ liệu và render
    if (userID) {
        getReserveDish();
        getReserveTable();
    } else {
        console.error("User ID not found in sessionStorage.");
    }
});