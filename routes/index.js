const express = require('express');
const router = express.Router();
const auth = require('../components/auth');


let Post = require('../models/post');
let News = require('../models/news');




// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Home Route
router.get('/', function (req, res) {
    Post.find({})
        .sort('-created_at')
        .limit(10)
        .exec(function (err, posts) {
            if (err) {
                console.log(err);
            } else {
                res.render('index', {
                    posts: posts
                });
            }
        });
});

router.get('/about', function (req, res, next) {
    res.render('site/about');
});

router.get('/faq', function (req, res, next) {
    res.render('site/faq');
});

router.get('/profile', auth.ensureAuthenticated, function (req, res, next) {
    res.render('site/profile', {
        user: req.user
    });
});

module.exports = router;
