const Branch = require('../branch/branchModel');
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
            const allBranch = await Branch.getdiliveryBranch();
            res.render('CustomerPage/reserveDish', {
                layout: 'Customer/CustomerMain',
                title: 'Reserve Dish Page',
                allBranch: allBranch,
                scripts: '<script src="/js/Customer/reserveDish.js"></script>'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    renderReserveTable: async (req, res) => {
        try {
            const allBranch = await Branch.getAllBranch();
            res.render('CustomerPage/reserveTable', {
                layout: 'Customer/CustomerMain',
                title: 'Reserve Dish Page',
                allBranch: allBranch,
                scripts: '<script src="/js/Customer/reserveTable.js"></script>'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    renderReserveHistory: async (req, res) => {
        try {
            res.render('CustomerPage/searchReserve', {
                layout: 'Customer/CustomerMain',
                title: 'Reserve Dish Page',
                scripts: '<script src="/js/Customer/searchReserve.js"></script>'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    submitReserveDish: async (req, res) => {
        try {
            const { branchId, orderDetails,MaxMPs,onlineTime, timer,userID} = req.body;
            await Reserve.submitReserveDish( branchId, orderDetails,MaxMPs,onlineTime, timer,userID );
            // Gửi phản hồi cho client
            res.status(200).send({ message: 'Order submitted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    submitReserveTable: async (req, res) => {
        try {
            const { branchId,khuvucId, orderDetails,MaxMPs,userID,date,time,note,guestCount} = req.body;
            // const branchDish = await Reserve.submitReserveDish(idBranch);
            // res.json(branchDish);
            // Xử lý dữ liệu đơn hàng (lưu vào cơ sở dữ liệu, tính toán, v.v.)
            await Reserve.submitReserveTable( branchId,khuvucId, orderDetails,MaxMPs,userID,date,time,note,guestCount);
            // Gửi phản hồi cho client
            res.status(200).send({ message: 'Order submitted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getReserveDishByUserID: async (req, res) => {
        try {
            const {userID} = req.params;
            const reserveDish = await Reserve.getReserveDishByUserID(userID);
            // Gửi phản hồi cho client
            res.json(reserveDish);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getReserveTableByUserID: async (req, res) => {
        try {
            const {userID} = req.params;
            const reserveDish = await Reserve.getReserveTableByUserID(userID);
            // Gửi phản hồi cho client
            res.json(reserveDish);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}

module.exports = reserveController;