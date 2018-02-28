const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

let News = require('../models/news');

router.get('/refresh', function (req, res) {
    News.find({})
        .sort('-created_at')
        .limit(10)
        .exec(function (err, newsblock) {
            if (err) {
                console.log(err);
            } else {
                res.render('news/newslist', {
                    newsblock: newsblock
                });
            }
        });
});

router.get('/all', function (req, res) {
    News.find({})
        .sort('-created_at')
        .exec(function (err, newsblock) {
            if (err) {
                console.log(err);
            } else {
                res.render('news/all', {
                    newsblock: newsblock
                });
            }
        });
});

router.get('/all/page/:id', function (req, res) {
    News.find({})
        .sort('-created_at')
        .exec(function (err, newsblock) {
            if (err) {
                console.log(err);
            } else {
                res.render('news/all', {
                    newsblock: newsblock
                });
            }
        });
});

module.exports = router;
