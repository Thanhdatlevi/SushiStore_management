module.exports.index = (req, res) => {
    res.render('AdminPage/index', {
        layout: 'Admin/AdminMain',
        title: 'Dashboard Amin',
        scripts: '<script src="/js/home.js"></script>'
    });
}