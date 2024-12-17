const Branch = require('./branchModel');
const branchController = {
    getAllBranch: async (req, res) => {
        try {
            const allBranch = await Branch.getAllBranch();
            res.json(allBranch);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getdiliveryBranch: async (req, res) => {
        try {
            const allBranch = await Branch.getdiliveryBranch();
            res.json(allBranch);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}

module.exports = branchController;