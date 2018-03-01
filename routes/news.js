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
   res.redirect('/news/all/page/1')
});


router.get('/all/page/:id', function (req, res) {

    News.paginate({}, {page: req.params.id, sort: '-created_at'}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for(let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('news/allnews', {
                allnews: result.docs,
                pagesarr: pagesarr,
                page_id: req.params.id
            });

        } else {
            console.log(err);
            res.end('Error');
        }
    });
});

module.exports = router;
