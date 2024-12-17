let currentPage = 1;
let totalpage;

function scrollToProductList() {
    const productList = document.getElementById('divide'); // Phần tử danh sách sản phẩm
    if (productList) {
        productList.scrollIntoView({ behavior: 'smooth' }); // Cuộn mượt mà đến phần tử
    }
}

// Áp dụng filter và lấy nội dung để render ra
const userID = sessionStorage.getItem('userID');
function applyFilters() {
    // Khởi tạo object filters
    const filters = {};
    filters["page"] = currentPage;
    // Lấy giá trị từ range sliders cho min và max price
    const minPrice = document.getElementById("min-price").value;
    const maxPrice = document.getElementById("max-price").value;
    if (minPrice) filters["minPrice"] = minPrice;
    if (maxPrice) filters["maxPrice"] = maxPrice;

    filters["userID"] = userID;

    // Tạo query parameters từ bộ lọc (filters)
    const queryParams = new URLSearchParams(filters).toString();
    fetch(`/employee/dish/api?${queryParams}`) // Yêu cầu bất đồng bộ
        .then(response => {
            if (!response.ok) {
                throw new Error('Lỗi mạng: ' + response.status);
            }
            return response.json(); // Chuyển đổi phản hồi thành JSON
        })
        .then(data => {
            // Hiển thị nội dung HTML trả về từ server
            renderHTML(data.html);
            // Hiển thị các nút phân trang
            renderPageButtons(data.totalPages);
            totalpage = data.totalPages;
            // Cập nhật URL trên trình duyệt mà không tải lại trang
            updateURL(queryParams);
        })
        .catch(error => {
            console.error('Lỗi:', error);
        });
    scrollToProductList()
}

// Render ra List những tour
function renderHTML(html) {
    const tourList = document.getElementById('showTours');
    tourList.innerHTML = html;  // Thay thế nội dung hiện tại bằng HTML mới
}

// Update URL người dùng thay đổi
function updateURL(queryParams) {
    const newURL = `${window.location.pathname}?${queryParams}`;
    history.pushState(null, '', newURL);  // Cập nhật URL mà không làm tải lại trang
}

// Hàm hiển thị các nút phân trang
function renderPageButtons(totalPages) {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = ''; // Xóa các nút phân trang hiện tại

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.onclick = () => {
            currentPage = i;
            applyFilters(); // Gọi AJAX khi nhấn vào số trang
        }

        if (i == currentPage) {
            pageButton.classList.add('active');
        }

        pageNumbersContainer.appendChild(pageButton);
    }
    // Cập nhật trạng thái nút Previous và Next
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}


function nextPage() {
    if (currentPage < totalpage) {
        currentPage++;
        applyFilters();
    }
}

// Hàm quay lại trang trước
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        applyFilters();
    }
}
function initializeEventListeners() {
    // Lắng nghe sự kiện thay đổi của range sliders (min-price và max-price)
    const minPriceSlider = document.getElementById("min-price");
    const maxPriceSlider = document.getElementById("max-price");

    if (minPriceSlider && maxPriceSlider) {
        // Lắng nghe sự kiện thay đổi giá trị
        [minPriceSlider, maxPriceSlider].forEach(slider => {
            slider.addEventListener("input", function () {
                currentPage = 1;
                // updatePriceLabels();
                applyFilters();
            });
        });
    }
}

function deleteItem(MaMon) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch('/employee/dish/deleteByEmployee', {
            method: 'POST', // Sử dụng POST thay vì DELETE
            headers: {
                'Content-Type': 'application/json', // Định dạng body là JSON
            },
            body: JSON.stringify({userID, dishID: MaMon}), // Gửi ID trong body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete the item');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Item deleted successfully!');
                applyFilters(); // Làm mới danh sách
            } else {
                alert('Failed to delete the item.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the item.');
        });
    }
}


document.addEventListener("DOMContentLoaded", function () {
    initializeEventListeners();
    applyFilters();
});

const minPrice = document.getElementById('min-price');
const maxPrice = document.getElementById('max-price');
const minPriceLabel = document.getElementById('min-price-label');
const maxPriceLabel = document.getElementById('max-price-label');
const sliderRange = document.getElementById('slider-range');

function updateSlider() {
    const min = parseInt(minPrice.value);
    const max = parseInt(maxPrice.value);

    // Prevent overlap
    if (min >= max) {
        if (this.id === 'min-price') {
            minPrice.value = max - 10000;
        } else {
            maxPrice.value = min + 10000;
        }
    }
    // Update labels
    minPriceLabel.textContent = `${minPrice.value} vnd`;
    maxPriceLabel.textContent = `${maxPrice.value} vnd`;

    // Update range highlight
    const percentMin = (minPrice.value / maxPrice.max) * 100;
    const percentMax = (maxPrice.value / maxPrice.max) * 100;
    sliderRange.style.left = `${percentMin}%`;
    sliderRange.style.right = `${100 - percentMax}%`;
}

// Add event listeners
minPrice.addEventListener('input', updateSlider);
maxPrice.addEventListener('input', updateSlider);

// Initialize positions
updateSlider();

// Hàm gửi yêu cầu fetch để cập nhật trạng thái giao hàng
function updateDelivery(maMon, giaoHangValue) {
    fetch(`/employee/dish/updateDelivery`, {
        method: 'POST', // hoặc 'PUT' tùy theo API
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            MaMon: maMon,
            GiaoHang: parseInt(giaoHangValue, 10),
            userID,
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Có lỗi xảy ra khi cập nhật trạng thái giao hàng.');
            }
            return response.json();
        })
        .then(result => {
            console.log('Cập nhật thành công:', result);
        })
        .catch(error => {
            console.error('Lỗi:', error);
        });
}

// Xử lý add món ăn
const btnAdd = document.getElementById('btnAdd');
const addDialog = document.getElementById('addDialog');
const cancelAdd = document.getElementById('cancelAdd');
const confirmAdd = document.getElementById('confirmAdd');
const productSelect = document.getElementById('productSelect');
const deliverySelect = document.getElementById('deliverySelect');

// Hiển thị dialog khi nhấn nút Add
btnAdd.addEventListener('click', async () => {
    try {
        const queryParams = new URLSearchParams({ userID: userID }).toString();
        // Lấy danh sách món ăn từ API
        const response = await fetch(`/employee/dish/getOrderKVDish?${queryParams}`);
        if (!response.ok) throw new Error('Lỗi khi tải danh sách món ăn.');
        const dishes = await response.json();

        // Xóa các option cũ
        productSelect.innerHTML = '';

        // Thêm các option mới
        dishes.forEach(dish => {
            const option = document.createElement('option');
            option.value = dish.MaMon;
            option.textContent = dish.TenMon;
            productSelect.appendChild(option);
        });

        // Hiển thị dialog
        addDialog.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        alert('Không thể tải danh sách món ăn.');
    }
});

// Ẩn dialog khi nhấn Hủy
cancelAdd.addEventListener('click', () => {
    addDialog.classList.add('hidden');
});

// Thêm món ăn vào cơ sở dữ liệu khi nhấn Thêm
confirmAdd.addEventListener('click', async () => {
    const MaMon = productSelect.value;
    const GiaoHang = parseInt(deliverySelect.value, 10);

    try {
        const response = await fetch('/employee/dish/addDishToBranch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({userID, MaMon, GiaoHang })
        });

        if (!response.ok) throw new Error('Lỗi khi thêm món ăn.');

        const result = await response.json();
        alert(result.message || 'Thêm món ăn thành công!');
        addDialog.classList.add('hidden');
        applyFilters();
    } catch (error) {
        console.error(error);
        alert('Không thể thêm món ăn.');
    }
});