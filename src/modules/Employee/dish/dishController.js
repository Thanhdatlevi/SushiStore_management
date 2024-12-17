const Dish = require('./dishModel');
const dishController = {
    getAllFilterDish: async (req, res) => {
        try {
            const { page, minPrice = -1, maxPrice = -1, userID} = req.query;
            const allDish = await Dish.getAllDish(userID, page, minPrice, maxPrice);
            let html = '';
            if (allDish.paginatedTours.length === 0 || page > allDish.totalPages) {
                html = '<p>No tours available</p>';
            }
            else
            allDish.paginatedTours.forEach(dish => {
                html += `
                <a href="#!" class="w-80 md:w-96 lg:w-80 mx-auto">
                    <div
                        class="flex flex-col justify-between bg-white rounded-lg shadow-lg overflow-hidden w-80 md:w-96 lg:w-80 h-80 tour transition-transform duration-300 ease-in-out hover:scale-105 mx-auto">
                        <div>
                            <!-- Giảm kích thước hình ảnh -->
                            <img src="/img/sushi.png" alt="" class="img w-full h-36 object-cover">
                            <div class="px-4">
                                <div class="flex justify-between mt-4 h-12">
                                    <h3 class="name text-lg font-semibold">${dish.TenMon}</h3>
                                    <p class="price text-gray-600">$${dish.Gia}</p>
                                </div>
                                <p class="text-gray-600 w-full overflow-hidden text-ellipsis line-clamp-2 mt-4">
                                Loại: ${dish.Loai}
                                </p>
                            </div>
                        </div>
                        <div class="flex justify-end gap-8 px-4">
                            <button type="button"
                                class="self-end mb-4 px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-950 btn"
                                value="${dish.MaMon}" onclick="deleteItem('${dish.MaMon}')"><i class="fa-solid fa-trash"></i></button>
                            <button type="button"

                            <label for="delivery-${dish.MaMon}" class="block text-sm font-medium text-gray-700 mb-4"></label>
                            <select id="delivery-${dish.MaMon}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                onchange="updateDelivery('${dish.MaMon}', this.value)">
                                <option value="1" ${dish.GiaoHang == 1 ? 'selected' : ''}>Có Giao Hàng</option>
                                <option value="0" ${dish.GiaoHang == 0 ? 'selected' : ''}>Không Giao Hàng</option>
                            </select>
                        </div>
                    </div>
                </a>
                `;
            });
            res.json({ html, totalPages: allDish.totalPages });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getAllDish: async (req, res) => {
        try {
            res.render('EmployeePage/dish', {
                layout: 'Employee/EmployeeMain',
                location_name: 'List Dish',
                loc_detail: `Here is a list of our top sushi dishes, carefully selected to bring you the most delicious and authentic flavors. From traditional sushi rolls to innovative creations, each dish is designed to satisfy the tastes of all sushi lovers. With the freshest ingredients and expert chefs, we are committed to delivering a memorable and mouthwatering dining experience. Let's dive into the world of sushi and explore the finest flavors that will leave you craving for more!`,
                title: 'Dish Page',
                scripts: '<script src="/js/Employee/dish.js"></script>'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getDishbyBranch: async (req, res) => {
        try {
            const { userID} = req.query;
            const branchDish = await Dish.getDishbyBranch(userID);
            res.json(branchDish);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getOrderKVDish: async (req, res) => {
        try {
            const { userID} = req.query;
            const branchDish = await Dish.getOrderKVDish(userID);
            res.json(branchDish);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    deleteByEmployee: async (req, res) => {
        try {
            const {userID, dishID } = req.body;
            await Dish.deleteByEmployee(dishID, userID);
            res.status(200).json({ success: 'delete successfull'});
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    updateDelivery: async (req, res) => {
        try {
            const { MaMon, GiaoHang,userID } = req.body;
            await Dish.updateDelivery(MaMon, GiaoHang,userID);
            res.status(200).json({ success: 'update successful'});
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    addDishToBranch: async (req, res) => {
        try {
            const {userID, MaMon, GiaoHang} = req.body;
            await Dish.addDishToBranch(MaMon, GiaoHang,userID);
            res.status(200).json({ success: 'Insert dish into chi nhanh successful'});
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}
module.exports = dishController;