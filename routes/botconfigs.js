const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const fileUpload = require('express-fileupload');
const mkdirp = require('mkdirp');

let Cryptr = require('cryptr'),
    cryptr = new Cryptr('qwerty123');

// Bot Models
let BotConfig = require('../models/botconfig');
let Order = require('../models/order');
// User Model
let User = require('../models/user');

router.use(fileUpload({
    safeFileNames: false,
}));

router.get('/', auth.ensureAuthenticated, function (req, res) {
    res.render('botconfig/botconfigs', {});
});

router.get('/gekko', auth.ensureAuthenticated, function (req, res) {
    BotConfig.find({
        bot: 'gekko'
    })
        .sort('-createdAt')
        .exec(function (err, botcfgs) {
            if (err) {
                console.log(err);
            } else {
                res.render('botconfig/gekko', {
                    title: 'Gekko',
                    user: req.user,
                    gekkocfgs: botcfgs.filter((data) => (data.cost === 0 || data.cost === null)),
                    gekkocfgs_p: botcfgs.filter((data) => (data.cost > 0))
                });
            }
        });
});

router.get('/haas', auth.ensureAuthenticated, function (req, res) {
    BotConfig.find({
        bot: 'haas'
    })
        .sort('-createdAt')
        .exec(function (err, botcfgs) {
            if (err) {
                console.log(err);
            } else {
                res.render('botconfig/haas', {
                    title: 'Haas',
                    user: req.user,
                    haascfgs: botcfgs.filter((data) => (data.cost === 0 || data.cost === null)),
                    haascfgs_p: botcfgs.filter((data) => (data.cost > 0))
                });
            }
        });
});

router.get('/cat', auth.ensureAuthenticated, function (req, res) {
    res.render('botconfig/cat', {});
});

router.get('/cryptophp', auth.ensureAuthenticated, function (req, res) {
    res.render('botconfig/cryptophp', {});
});

router.get('/gimmer', auth.ensureAuthenticated, function (req, res) {
    res.render('botconfig/gimmer', {});
});

router.get('/admin', auth.ensureManager, function (req, res) {
    BotConfig.find({})
        .sort('-createdAt')
        .exec(function (err, configs) {
            if (err) {
                console.log(err);
            } else {
                res.render('botconfig/admin', {
                    user: req.user,
                    configs: configs
                });
            }
        });
});

router.get('/admin/forms/:bot', auth.ensureManager, function (req, res) {
    bot = req.params.bot;
    res.render('botconfig/forms/' + bot, {});
});

router.post('/add', auth.ensureManager, function (req, res) {

    req.checkBody('bot', 'Bot is required').notEmpty();
    req.checkBody('cfg_name', 'Name of config is required').notEmpty();
    req.checkBody('market', 'Market is required').notEmpty();
    req.checkBody('preview', 'Preview is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('botconfig/admin', {
            errors: errors
        });
    } else {

        let botcfg;

        switch (req.body.bot) {
            case 'haas':
                botcfg = fillHaasCfg(req);
                break;
            case 'gekko':
                botcfg = fillGekkoCfg(req);
                break;
        }

        let file = req.files.arclink;

        if (file) {

            if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-rar-compressed') {
                let dirpath = __dirname + '/../storage/botscfg/' + botcfg.bot + '/' + botcfg.name;

                mkdirp(dirpath, function (err) {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        file.mv(dirpath + '/' + file.name, function (err) {
                            if (!err) {
                                // encrypt for restrict direct access
                                botcfg.arclink = cryptr.encrypt(botcfg.bot + '/' + botcfg.name + '/' + file.name);
                                botcfg.save();
                                console.log('Archive "' + file.name + '" to "' + botcfg.bot + '/' + botcfg.name + '" successfully added!')
                            } else {
                                console.log(err)
                            }
                        });
                    }
                });
            } else req.flash('error', 'File not supported');
        }

        botcfg.save(function (err) {
            if (err) {
                return console.log(err);
            } else {
                req.flash('success', 'Config added');
                res.redirect('/botconfigs/admin');
            }
        });
    }

});

// Load Edit Form
router.get('/edit/:id', auth.ensureManager, function (req, res) {

    BotConfig.findById(req.params.id, function (err, botcfg) {
        if (err) {
            return console.log(err)
        } else if (!(req.user._id.equals(botcfg.author)) || !(req.user.login === 'admin')) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        } else {
            res.render('botconfig/edit_botconfig', {
                title: 'Edit "' + botcfg.name + '" configuration.',
                botcfg: botcfg
            });
        }
    });
});

// Update Submit POST Route
router.post('/edit/:id', auth.ensureManager, function (req, res) {
    let botcfg = {};
    botcfg.name = req.body.cfg_name;
    botcfg.version = req.body.cfg_ver;
    botcfg.cost = req.body.cost;
    // botcfg.bot = req.body.bot;
    botcfg.preview = req.body.preview.replace(/(\r\n|\n|\r)/gm, "");
    botcfg.body = req.body.body.replace(/(\r\n|\n|\r)/gm, "");

    let query = {_id: req.params.id};

    BotConfig.update(query, botcfg, function (err) {
        if (err) {
            return console.log(err);
        } else {
            req.flash('success', 'Config updated');
            res.redirect('/botconfigs/admin');
        }
    });
});

// Delete BotConfig
router.get('/delete/:id', auth.ensureManager, function (req, res) {
    BotConfig.findById(req.params.id, function (err, botcfg) {

        if (req.user._id.equals(botcfg.author) || req.user.status === 4) {
            Post.findById(req.params.id).remove().exec(function (err, data) {
                if (!err) {
                    req.flash('success', 'Config deleted');
                    res.redirect('/botconfigs/admin');
                }
            });
        } else {
            res.status(500).send();
        }
    });
});

// Get BotConfig
router.get('/:id', auth.payedResource, function (req, res, next) {

        BotConfig.findById(req.params.id, function (err, botcfg) {
            if (botcfg) {
                User.findById(botcfg.author, function (err, user) {
                    if (err) {
                        res.status(500).send();
                    } else {
                        res.render('botconfig/botconf', {
                            username: user.name,
                            botcfg: botcfg
                        });
                    }
                });
            }
            else res.status(500).send();
        });
});

// Post Order
router.get('/buy/:id', auth.ensureAuthenticated, function (req, res) {
    BotConfig.findById(req.params.id, function (err, botcfg) {
        if (botcfg) {
            if (!err) {

                let order = new Order();

                order.user_id = req.user._id;
                order.type = 1;
                order.cfg_id = botcfg._id;
                order.cfg_name = botcfg.name;
                order.addr = '1GMnp2zKcBr2SctLA1magPr9rSXHriLSz5';

                order.save(function (err) {
                    if (err) {
                        req.flash('error', 'You already bought this');
                        res.redirect('/botconfigs/' + botcfg.bot);
                        // res.status(500).send();
                    } else {
                        req.flash('success', 'Order placed');
                        res.render('botconfig/buybtcfg', {
                            botcfg: botcfg,
                            botorder: order
                        });
                    }
                });
            }
            else res.end(err);
        }
        else res.status(500).send();
    });
});


function fillHaasCfg(req) {

    let botcfg = new BotConfig();

    let mh_min_pr_c2b = req.body.mh_min_pr_c2b ? 'on' : 'off';
    let bbs_r_fcc = req.body.bbs_r_fcc ? 'on' : 'off';
    let bbs_res_middle = req.body.bbs_res_middle ? 'on' : 'off';
    let bbs_al_mid_sells = req.body.bbs_al_mid_sells ? 'on' : 'off';

    botcfg.author = req.user._id;
    botcfg.name = req.body.cfg_name;
    botcfg.version = req.body.cfg_ver;
    botcfg.bot = req.body.bot;
    botcfg.market = req.body.market;
    botcfg.preview = req.body.preview;
    botcfg.body =
        '<h4>Trade amount settings</h4>'
        + '<p># Coin position: <strong>' + req.body.coin_pos + '</strong></p>'
        + '<p># Trade amount: <strong>' + req.body.ta + '</strong></p>'
        + '<p># Template: <strong>' + req.body.template + '</strong></p>'
        + '<p># Fee: <strong>' + req.body.fee + '</strong></p>'
        + '<br>'
        + '<h4>Mad hatter mode</h4>'
        + '<p># Min Price Change To Buy: <strong>' + mh_min_pr_c2b + '</strong></p>'
        + '<br>'
        + '<h4>Safety settings</h4>'
        + '<p># Min Price Change To Buy: <strong>' + req.body.ss_min_pr_c2b + '</strong></p>'
        + '<p># Min Price Change To Sell: <strong>' + req.body.ss_min_pr_c2s + '</strong></p>'
        + '<p># Stop Loss (%): <strong>' + req.body.stoploss + '</strong></p>'
        + '<br>'
        + '<h4>Bollinger Bands Settings</h4>'
        + '<p># Length: <strong>' + req.body.bbs_length + '</strong></p>'
        + '<p># Dev.up: <strong>' + req.body.bbs_devup + '</strong></p>'
        + '<p># Dev.down: <strong>' + req.body.bbs_devdown + '</strong></p>'
        + '<p># MA Type: <strong>' + req.body.bbs_matype + '</strong></p>'
        + '<p># Deviation: <strong>' + req.body.bbs_deviation + '</strong></p>'
        + '<p># Require FCC: <strong>' + bbs_r_fcc + '</strong></p>'
        + '<p># Reset middle <strong>' + bbs_res_middle + '</strong></p>'
        + '<p># Allow mid sells <strong>' + bbs_al_mid_sells + '</strong></p>'
        + '<br>'
        + '<h4>RSI settings</h4>'
        + '<p># Length: <strong>' + req.body.rsi_length + '</strong></p>'
        + '<p># Buy Level: <strong>' + req.body.rsi_b_lev + '</strong></p>'
        + '<p># Sell Level: <strong>' + req.body.rsi_s_lev + '</strong></p>'
        + '<br>'
        + '<h4>MACD settings</h4>'
        + '<p># MACD Fast: <strong>' + req.body.macd_fast + '</strong></p>'
        + '<p># MACD Slow: <strong>' + req.body.macd_slow + '</strong></p>'
        + '<p># MACD Signal: <strong>' + req.body.macd_signal + '</strong>';

    botcfg.cost = req.body.cost;

    return botcfg;
}

function fillGekkoCfg(req) {

    let botcfg = new BotConfig();

    botcfg.author = req.user._id;
    botcfg.name = req.body.cfg_name;
    botcfg.bot = req.body.bot;
    botcfg.market = req.body.market;
    botcfg.preview = req.body.preview;
    botcfg.body = req.body.body;
    botcfg.cost = req.body.cost;

    return botcfg;
}


module.exports = router;