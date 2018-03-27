const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const env = require('../config/env');
const fileUpload = require('express-fileupload');
const mkdirp = require('mkdirp');

let Cryptr = require('cryptr'),
    cryptr = new Cryptr('qwerty123');

let Order = require('../models/order');
let Subscribe = require('../models/subscribe');

router.use(fileUpload({
    safeFileNames: false,
}));

router.get('/', auth.ensureAuthenticated, function (req, res, next) {
    Order.find()
        .where({user_id: req.user._id})
        .sort('-createdAt')
        .exec(function (err, orders) {
            if (err) {
                res.status(500).send();
            } else {
                Subscribe.findOne().where({user_id: req.user._id}).exec(function (err, subscribe) {
                    if (!err) {
                        res.render('profile/profile', {
                            user: req.user,
                            orders: orders,
                            subscribe: subscribe
                        });
                    }
                });
            }
        });
});

router.get('/subscribe', auth.ensureAuthenticated, function (req, res, next) {

    // req.flash('success', 'Order placed');
    res.render('profile/subscribe', {
        btcaddr: '984f71h3048f73gf29703fg13478gf43'
    });

    // let subscribe = new Subscribe();
    //
    // subscribe.user_id = req.user._id;
    // subscribe.save(function (err) {
    //     if (err) {
    //         res.render('error', {
    //             message: 'Internal error',
    //             error: {status: 'Code: 500', stack: 'We`ll check it.'}
    //         });
    //     } else {
    //         req.flash('success', 'Order placed');
    //         res.render('profile/subscribe', {
    //             subscribe: subscribe
    //         });
    //     }
    // });
});

router.post('/subscribe/confirm', auth.ensureAuthenticated, function (req, res, next) {

        let bank = parseInt(req.body.bankreq.slice(-1));
        let requisites = '';

        switch (bank) {
            case 1: requisites = 'Сбербанк. Номер карты: 4276 5500 2633 9625'; break;
            case 2: requisites = 'Тинькофф. Номер карты: 5536 9137 6085 4196'; break;
            default: requisites = '';
        }

        let subscribe = new Subscribe();
        subscribe.user_id = req.user._id;
        subscribe.requisites = requisites;
        subscribe.interval = req.body.paym_interval;
        subscribe.currency = req.body.bank_currency;
        subscribe.cost = req.body.rub_cost;

        let file = req.files.bankinvfile;

        if (file) {
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
                let dirpath = __dirname + '/../storage/subscribes/' + req.user.login;

                mkdirp(dirpath, function (err) {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        file.mv(dirpath + '/' + file.name, function (err) {
                            if (!err) {
                                // encrypt for restrict direct access
                                subscribe.receipt = cryptr.encrypt(req.user.login + '/' + file.name);
                                subscribe.save();
                            } else {
                                console.log(err)
                            }
                        });
                    }
                });
            } else req.flash('error', 'File not supported');
        }

        subscribe.save(function (err) {
            if (err) {
                return console.log(err);
            } else {
                req.flash('success', 'Thank you, we`ll check the payment and change your status');
                res.redirect('/profile');
            }
        });

    // let subscribe = new Subscribe();
    //
    // subscribe.user_id = req.user._id;
    // subscribe.save(function (err) {
    //     if (err) {
    //         res.render('error', {
    //             message: 'Internal error',
    //             error: {status: 'Code: 500', stack: 'We`ll check it.'}
    //         });
    //     } else {
    //         req.flash('success', 'Order placed');
    //         res.render('profile/subscribe', {
    //             subscribe: subscribe
    //         });
    //     }
    // });
});


module.exports = router;
