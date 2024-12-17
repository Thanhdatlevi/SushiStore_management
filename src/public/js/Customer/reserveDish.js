// Hàm lấy danh sách món ăn từ API theo chi nhánh
async function fetchDishesByBranch(branchId) {
    try {
        const response = await fetch(`/Customer/dish/getDishbyBranch/${branchId}`);
        if (!response.ok) {
            throw new Error('Không thể lấy dữ liệu món ăn');
        }
        const data = await response.json();
        return data; // Giả sử server trả về danh sách món ăn trong key `dishes`
    } catch (error) {
        console.error('Lỗi:', error);
        return [];
    }
}

// Hàm render các món ăn vào select
function renderDishOptions(dishes) {
    const dishesContainer = document.getElementById('dish-container');
    // dishesContainer.innerHTML = ''; // Xóa các món ăn cũ

    // Tạo select cho món ăn
    const dishSelect = document.createElement('div');
    dishSelect.classList.add('mb-6');
    dishSelect.innerHTML = `
        <select name="mon_an" class="p-2 border rounded-md w-full mb-4">
            <option value="" disabled selected>Món ăn</option>
            ${dishes.map(dish => `
                <option value="${dish.MaMon}" data-price="${dish.Gia}">${dish.TenMon} - ${dish.Gia} VND</option>
            `).join('')}
        </select>
        <div class="flex items-center justify-between mb-4">
            <span class="price text-xl font-semibold">0 VND</span>
            <div class="flex items-center">
                <button class="decrease p-2 bg-gray-300 rounded-l-md">-</button>
                <span class="quantity px-4 text-xl">1</span>
                <button class="increase p-2 bg-gray-300 rounded-r-md">+</button>
            </div>
        </div>
        <hr>
    `;
    dishesContainer.appendChild(dishSelect);
    
    // Thêm sự kiện cho các nút + và -
    const increaseButtons = dishSelect.querySelectorAll('.increase');
    const decreaseButtons = dishSelect.querySelectorAll('.decrease');
    const quantitySpans = dishSelect.querySelectorAll('.quantity');
    const priceSpans = dishSelect.querySelectorAll('.price');
    const dishSelects = dishSelect.querySelectorAll('select[name="mon_an"]');
    increaseButtons.forEach((button, index) => {
        button.addEventListener('click', () => updateQuantity(index, 1, priceSpans, dishSelects, quantitySpans));
    });

    decreaseButtons.forEach((button, index) => {
        button.addEventListener('click', () => updateQuantity(index, -1, priceSpans, dishSelects, quantitySpans));
    });

    dishSelects.forEach((select, index) => {
        select.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex]; 
            const price = selectedOption.getAttribute('data-price');
            priceSpans[index].innerText = `${price} VND`;
            updateQuantity(index, 0, priceSpans, dishSelects, quantitySpans); // Cập nhật lại giá sau khi thay đổi món ăn
        });
    });

    updateTotalPrice() 
}

// Cập nhật số lượng và giá khi + hoặc -
function updateQuantity(index, change, priceSpans, dishSelects, quantitySpans) {
    
    const quantity = quantitySpans[index];
    const priceSpan = priceSpans[index];
    let currentQuantity = parseInt(quantity.innerText);

    currentQuantity += change;
    if (currentQuantity < 1) currentQuantity = 1;
    quantity.innerText = currentQuantity;

    const selectedOption = dishSelects[index].options[dishSelects[index].selectedIndex]; 
    const price = selectedOption.getAttribute('data-price');
    priceSpan.innerText = `${(price * currentQuantity)} VND`;

    updateTotalPrice();
}

// Hàm xử lý thay đổi chi nhánh
document.getElementById('cn').addEventListener('change', async (event) => {
    const branchId = event.target.value;
    const dishesContainer = document.getElementById('dish-container');
    dishesContainer.innerHTML = ''; // Xóa các món ăn cũ
    if (branchId) {
        const dishes = await fetchDishesByBranch(branchId);
        renderDishOptions(dishes);
    }
});

// Hàm thêm món ăn
document.getElementById('addDishButton').addEventListener('click', () => {
    const branchId = document.getElementById('cn').value;
    if (branchId) {
        fetchDishesByBranch(branchId).then(dishes => {
            renderDishOptions(dishes);
        });
    }
});

// Hàm tính tổng giá và cập nhật vào totalPrice
function updateTotalPrice() {
    const priceElements = document.querySelectorAll('.price'); // Lấy tất cả các phần tử .price
    let total = 0;

    priceElements.forEach(priceElement => {
        const priceText = priceElement.innerText.replace(' VND', '').replace(',', ''); // Loại bỏ đơn vị VND và dấu phẩy
        const price = parseInt(priceText) || 0; // Chuyển đổi sang số nguyên
        total += price;
    });

    // Hiển thị tổng giá
    const totalPriceElement = document.getElementById('totalPrice');
    totalPriceElement.innerText = `${total.toLocaleString()} VND`; // Định dạng số với dấu phẩy
}

let startTime = new Date();

document.getElementById('submitButton').addEventListener('click', async () => {
    let MaxMP = null;
    const endTime = new Date(); 
    const timeRange = new Date(endTime - startTime);
    const timeSpent = `${timeRange.getHours()}:${timeRange.getMinutes()}:${timeRange.getSeconds()}`

    const onlineTime = `${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`;
    // Lấy tất cả các món ăn đã chọn và số lượng từ các trường chọn (select)
    const dishSelects = document.querySelectorAll('select[name="mon_an"]');
    const quantities = document.querySelectorAll('.quantity');
    // Tạo một mảng để chứa thông tin MaMon và số lượng
    const orderDetails = [];
    dishSelects.forEach((select, index) => {
        const maMon = select.value;  // MaMon của món ăn
        const quantity = quantities[index].innerText;  // Số lượng món ăn
        
        // Kiểm tra nếu có món ăn được chọn
        if (maMon && quantity > 0) {
            orderDetails.push({ MaMon: maMon, SoLuong: quantity });
        }
    });
    try {
        const resMaxMP = await fetch(`/Customer/reserve/getMaxMP`);
        if (!resMaxMP.ok) {
            throw new Error('Không thể lấy dữ liệu món ăn');
        }
        MaxMP = await resMaxMP.json();
    } catch (error) {
        console.error('Lỗi:', error);
        return [];
    }
    const userID = sessionStorage.getItem('userID');
    // Gửi thông tin đến server thông qua fetch API (POST request)
    try {
        const response = await fetch('/Customer/reserve/dishSubmit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                branchId: document.getElementById('cn').value,  // Mã chi nhánh
                orderDetails: orderDetails,
                MaxMPs: MaxMP[0].next_MaPhieu,
                onlineTime: onlineTime,
                timer: timeSpent,
                userID,
            }),
        });

        if (response.ok) {
            console.log('Order submitted successfully!');
            // Xử lý phản hồi từ server nếu cần
        } else {
            console.error('Error submitting order');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});