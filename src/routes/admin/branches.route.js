const express = require("express");
const route = express.Router();
const branchesController = require("../../controllers/admin/branches.controller");

route.get('/', branchesController.getAllBranches);

// Thêm chi nhánh
// router.get('/branches/add', (req, res) => res.render('admin/pages/addBranch')); 
route.get('/add', (req, res) => {
    res.render('admin/pages/addBranches', {
        layout: 'admin_layouts/mainAdmin',
        title: 'Branches',
        scripts: '<script src="/js/home.js"></script>',
        //branches: result.recordset
      });
}); 
route.post('/add', branchesController.addBranch); // Xử lý thêm chi nhánh

// Sửa chi nhánh
route.get('/edit/:id', branchesController.getBranchById); // Render form sửa chi nhánh
route.post('/edit/:id', branchesController.editBranch); // Xử lý sửa chi nhánh

// Xóa chi nhánh
route.post('/delete/:id', branchesController.deleteBranch); // Xử lý xóa chi nhánh


module.exports = route