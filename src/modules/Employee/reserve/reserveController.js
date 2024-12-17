const Reserve = require('./reserveModel');
const reserveController = {
    getMaxMP: async (req, res) => {
        try {
            const MaxMP = await Reserve.getMaxMP();
            res.json(MaxMP);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    renderReserveDish: async (req, res) => {
        try {
            res.render('EmployeePage/reserveDish', {
                layout: 'Employee/EmployeeMain',
                title: 'Reserve Dish Page',
                scripts: '<script src="/js/Employee/reserveDish.js"></script>'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    renderStatic: async (req, res) => {
        try {
            res.render('EmployeePage/searchStatic', {
                layout: 'Employee/EmployeeMain',
                title: 'Reserve Dish Page',
                scripts: '<script src="/js/Employee/searchReserve.js"></script>'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    submitReserveDish: async (req, res) => {
        try {
            const {  orderDetails,MaxMPs,cccd, SoBan, userID } = req.body;

            await Reserve.submitReserveDish( orderDetails,MaxMPs,cccd,SoBan, userID );
            // Gửi phản hồi cho client
            res.status(200).send({ message: 'Order submitted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    statisticsByBranch: async (req, res) => {
        try {
            const {userID} = req.query;
            const reserveDish = await Reserve.statisticsByBranch(userID);
            res.json(reserveDish);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}

module.exports = reserveController;