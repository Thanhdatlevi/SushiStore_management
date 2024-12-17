const Dish = require('./dishModel');
const dishController = {
    getAllFilterDish: async (req, res) => {
        try {
            const { page, location = -1, branch = -1, minPrice = -1, maxPrice = -1 } = req.query;
            const allDish = await Dish.getAllDish(page, location, branch, minPrice, maxPrice);
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
                                <p class="text-gray-600 w-full overflow-hidden text-ellipsis line-clamp-2">
                                ${dish.Loai}
                                </p>
                            </div>
                        </div>
                        <div class="flex gap-2 px-4 mb-10">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
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
            res.render('UnloginPage/dish', {
                layout: 'Unlogin/UnloginMain',
                location_name: 'Popular',
                loc_detail: `Here is a list of our top tours that we have carefully selected to bring you the best experiences. From journeys to explore pristine nature to cultural excursions rich in local identity, each tour is designed to meet the diverse interests and needs of visitors. With a team of professional guides and dedicated services, we are committed to bringing you a memorable and inspiring journey. Let's explore the most wonderful destinations through our attractive tours!`,
                title: 'Dish Page',
                scripts: '<script src="/js/Customer/dish.js"></script>'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getDishbyBranch: async (req, res) => {
        try {
            const { idBranch } = req.params
            const branchDish = await Dish.getDishbyBranch(idBranch);
            res.json(branchDish);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}

module.exports = dishController;