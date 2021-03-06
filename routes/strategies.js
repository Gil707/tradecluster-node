const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

router.get('/', auth.ensureAuthenticated, function(req, res){

    res.render('strategy/strategies', {
        title: 'My strategies',
        user: req.user
    });
});

router.get('/data/cci', auth.ensureAuthenticated, function(req, res){
    res.render('strategy/data/cci', {
        user: req.user
    });
});

module.exports = router;