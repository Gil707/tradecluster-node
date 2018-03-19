const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

let TradeNews = require('../models/tradenews');


router.get('/refresh', function (req, res) {

    let skip = (req.user && req.user.status > 1) ? 0 : 3;

    TradeNews.find({})
        .sort('-createdAt')
        .limit(10)
        .skip(skip)
        .exec(function (err, tradenewsblock) {
            if (err) {
                console.log(err);
            } else {
                res.render('tradenews/tradenewslist', {
                    tradenewsblock: tradenewsblock
                });
            }
        });
});

router.get('/all', function (req, res) {
   res.redirect('/tradenews/all/page/1')
});


router.get('/all/page/:id', function (req, res) {

    let skip = (req.user && req.user.status > 1) ? 0 : 3;

    TradeNews.paginate({}, {page: req.params.id, sort: '-createdAt', offset: skip}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for(let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('tradenews/alltradenews', {
                alltradenews: result.docs,
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
