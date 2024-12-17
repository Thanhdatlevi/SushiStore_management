const express = require('express');
const router = express.Router();
const loginController = require('../../modules/Unlogin/login/loginController');

router.get('/', async (req, res) => {
    try {
        res.render('UnloginPage/login', {
            layout: 'Unlogin/UnloginMain',
            title: 'Home Page',
            scripts: '<script src="/js/Unlogin/login.js"></script>',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/authentication', loginController.checkLogin);

module.exports = router;