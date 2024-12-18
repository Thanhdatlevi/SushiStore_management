const express = require('express');
const router = express.Router();

//Route connect Home Page
router.get('/', async (req, res) => {
    try {
        res.render('home', {
            layout: 'main',
            title: 'Home Page',
            scripts: '<script src="/js/home.js"></script>'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;