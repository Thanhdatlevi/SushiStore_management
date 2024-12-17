const express = require('express');
const router = express.Router();

//Route connect Home Page
router.get('/', async (req, res) => {
    try {
        res.render('UnloginPage/home', {
            layout: 'Unlogin/UnloginMain',
            title: 'Home Page',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;