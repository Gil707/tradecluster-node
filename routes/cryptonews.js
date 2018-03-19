const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

let CryptoNews = require('../models/cryptonews');


router.get('/refresh', function (req, res) {
    CryptoNews.find({})
        .sort('-createdAt')
        .limit(10)
        .exec(function (err, cryptonewsblock) {
            if (err) {
                console.log(err);
            } else {
                res.render('cryptonews/cryptonewslist', {
                    cryptonewsblock: cryptonewsblock
                });
            }
        });
});

router.get('/all', function (req, res) {
   res.redirect('/cryptonews/all/page/1')
});


router.get('/all/page/:id', function (req, res) {

    CryptoNews.paginate({}, {page: req.params.id, sort: '-createdAt'}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for(let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('cryptonews/allcryptonews', {
                allcryptonews: result.docs,
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
