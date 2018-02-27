const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

let News = require('../models/news');

router.get('/refresh', function (req, res) {
    News.find({})
        .sort('-created_at')
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

module.exports = router;
