const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const env = require('../config/env');
// const cfgreciever = require('../components/cfgreciever');

let send = require('gmail-send')({
    user: env.gmailUser,
    pass: env.gmailPass
});

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

    Order.findById(req.params.id, function (err, order) {
        if (!err) {
            BotConfig.findById(order.cfg_id, function (err, botcfg) {

                if (allow) {
                    order.balance = 0;
                    order.payed = true;
                } else {
                    order.balance = -botcfg.cost;
                    order.payed = false;
                }

                order.save(function (err) {
                    if (err) {
                        res.render('error', {
                            message: 'Internal error',
                            error: {status: 'Code: 500', stack: 'Something goes wrong.'}
                        });
                    } else {
                        if (allow) {
                            send({
                                to: 'kuzclan@mail.ru',
                                subject: env.gmailSubject + 'Access to ' + botcfg.name + ' config for ' + botcfg.bot + ' granted.',
                                html: env.gmailHtml + '<p>Hi, new option unlocked in your <a href="http://localhost:3000/profile" target="_blank">profile</a></p> ' +
                                '<p>Or go directly to your <span style="text-transform: uppercase; font-weight: bold">' +
                                botcfg.name + '</span> v.: ' + botcfg.version + ' (' + botcfg.bot + ') ' +
                                '<a href="http://localhost:3000/botconfigs/' + botcfg._id + '" target="_blank">config</a></p>' +
                                '<br><h3>Thank you for purchasing our products.</h3>' +
                                env.gmailHtmlFooter
                            }, function (err, res) {
                                console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
                            });
                        }
                    }
                })
            });
        }

        else console.log(err);
    });

    // Order.findByIdAndUpdate(req.params.id, {payed: allow, balance: 0}, function (err) {
    //     if (err) {
    //         res.render('error', {
    //             message: 'Internal error',
    //             error: {status: 'Code: 500', stack: 'Something goes wrong.'}
    //         });
    //     }
    //     else {
    //         if (allow) {
    //             send({
    //                 to: 'kuzclan@mail.ru',
    //                 subject: env.gmailSubject + 'Access to config granted.',
    //                 html: env.gmailHtml + '<p>Please check your <a href="http://localhost:3000/profile" target="_blank">profile</a></p>' +
    //                 '<p>Thank you for purchasing our products.</p>' +
    //                 env.gmailHtmlFooter
    //             }, function (err, res) {
    //                 console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
    //             });
    //         }
    //     }
    // })
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
