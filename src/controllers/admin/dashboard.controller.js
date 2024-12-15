module.exports.index = (req, res) => {
    res.render('./admin/pages/index.hbs', {
        layout: 'admin_layouts/mainAdmin',
        title: 'Dashboard Amin',
        scripts: '<script src="/js/home.js"></script>'
    });
}


    // tồng doanh thu

    // tổng chi nhánh

    // tổng món ăn

    // tổng người dùng
    