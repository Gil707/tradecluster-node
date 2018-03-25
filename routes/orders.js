const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const env = require('../config/env');
// const cfgreciever = require('../components/cfgreciever');
const sendmail = require('sendmail')();

let Order = require('../models/order');
let BotConfig = require('../models/botconfig');

router.get('/', function (req, res, next) {
    return next;
});

router.post('/confirmpayment/:id', auth.ensureAuthenticated, function (req, res) {
    Order.findByIdAndUpdate(req.params.id, {send_payment: true}, function (err) {
        if (err) {
            res.render('error', {
                message: 'Internal error',
                error: {status: 'Code: 500', stack: 'Something goes wrong.'}
            });
        } else {
            req.flash('success', 'Thank you, we will check the payment and send confirmation');
            res.redirect('/profile');
        }
    })
});

router.post('/changeaccess/:id/:action', auth.ensureManager, function (req, res) {

    let allow = (req.params.action === 'allow');

    if (allow) {
        sendmail({
            from: env.noReplyEmail,
            to: 'kuzclan@mail.ru',
            subject: 'Access to config (' + req.params.id + ') allowed',
            html: 'Please go to <a href="http://localhost:3000/botconfigs/' + req.params.id + '">Config</a>',
        }, function (err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        });
    }

    Order.findByIdAndUpdate(req.params.id, {payed: allow, balance: 0}, function (err) {
        if (err) {
            res.render('error', {
                message: 'Internal error',
                error: {status: 'Code: 500', stack: 'Something goes wrong.'}
            });
        }
        // else {
        // res.redirect('/');
        // }
    })
});


router.get('/invoice/:id', auth.ensureAuthenticated, function (req, res) {
    Order.findById(req.params.id, function (err, order) {
        if (!err && order) {

            switch (order.type) {
                case 1 :
                    BotConfig.findById(order.cfg_id, function (err, botcfg) {
                        res.render('botconfig/buybtcfg', {botcfg: botcfg, botorder: order});
                    });
                    break;
                default :
                    return null;
            }

            // BotConfig.findById(order.cfg_id, function (err, botcfg) {
            //     res.render('botconfig/buybtcfg', {
            //         botcfg: botcfg,
            //         botorder: order
            //     });
            // });
        }
        else res.end(err);
    });
});

module.exports = router;
