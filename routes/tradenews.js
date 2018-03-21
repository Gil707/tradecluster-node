const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const env = require('../config/env');

let TradeNews = require('../models/tradenews');

router.get('/refresh', function (req, res) {

    let filter = (req.user && req.user.status > 1) ? {} : { createdAt: { $lt: new Date(Date.now() - env.awaitTimeNews) } };

    TradeNews.find(filter)
        .sort('-createdAt')
        .limit(10)
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

    let filter = (req.user && req.user.status > 1) ? {} : { createdAt: { $lt: new Date(Date.now() - env.awaitTimeNews) } };

    TradeNews.paginate(filter, {page: req.params.id, sort: '-createdAt'}).then(function (result, err) {
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
