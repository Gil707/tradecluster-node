const express = require('express');
const router = express.Router();
const auth = require('../components/auth');


router.get('/', auth.ensureAuthenticated, function(req, res){
    res.render('analysis/analyzes', {
        title: 'Analyzes',
        user: req.user
    });
});

module.exports = router;