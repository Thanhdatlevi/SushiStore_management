let currentPage = 1;
let totalpage;

function scrollToProductList() {
    const productList = document.getElementById('divide'); // Phần tử danh sách sản phẩm
    if (productList) {
        productList.scrollIntoView({ behavior: 'smooth' }); // Cuộn mượt mà đến phần tử
    }
}

// Hàm khôi phục trạng thái filter từ URL
function restoreFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("query");
    if (searchParam) {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.value = searchParam;  // Đặt giá trị tìm kiếm vào ô input
        }
    }
    // Lặp qua các tham số URL và khôi phục giá trị
    params.forEach((value, key) => {
        const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
        if (radio) {
            radio.checked = true; // Đánh dấu radio button đã chọn
            const label = radio.nextElementSibling?.textContent;
        }
    });
    currentPage = params.get("page") || 1;
}

// Áp dụng filter và lấy nội dung để render ra
function applyFilters() {
    // Khởi tạo object filters
    const filters = {};

    // Lấy giá trị từ dropdown menu cho "branch"
    const branchSelect = document.getElementById("branch-select");
    if (branchSelect && branchSelect.value) {
        filters["branch"] = branchSelect.value;
    }
    filters["page"] = currentPage;
    // Lấy giá trị từ range sliders cho min và max price
    const minPrice = document.getElementById("min-price").value;
    const maxPrice = document.getElementById("max-price").value;
    if (minPrice) filters["minPrice"] = minPrice;
    if (maxPrice) filters["maxPrice"] = maxPrice;

    // Tạo query parameters từ bộ lọc (filters)
    const queryParams = new URLSearchParams(filters).toString();
    fetch(`/dish/api?${queryParams}`) // Yêu cầu bất đồng bộ
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

    // Lắng nghe sự kiện thay đổi của dropdown menu (branch)
    const branchSelect = document.getElementById("branch-select");
    if (branchSelect) {
        branchSelect.addEventListener("change", function () {
            currentPage = 1;
            applyFilters();
        });
    }

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
document.addEventListener("DOMContentLoaded", function () {
    // const locationRadios = document.querySelectorAll('input[name="location"]');
    // const branchSelect = document.querySelectorAll('select[name="branch"]');
    // const priceRadios = document.querySelectorAll('input[name="price"]');
    // Lắng nghe sự thay đổi của các radio buttons
    initializeEventListeners();

    restoreFiltersFromURL();
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