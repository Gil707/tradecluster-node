const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

let multipart = require('connect-multiparty');
let multipartMiddleware = multipart();


let Post = require('../models/post');
let CryptoNews = require('../models/cryptonews');

let fn = require('../components/fn');



// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

router.post('/uploader', multipartMiddleware, auth.ensureAuthenticated, fn);

// Home Route
router.get('/', function (req, res) {
    Post.find({})
        .sort('-created_at')
        .limit(6)
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
