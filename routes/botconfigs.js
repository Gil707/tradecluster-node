const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const fileUpload = require('express-fileupload');
const mkdirp = require('mkdirp');

let Cryptr = require('cryptr'),
    cryptr = new Cryptr('qwerty123');

// Post Model
let BotConfig = require('../models/botconfig');
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
        .sort('-created_at')
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
        .sort('-created_at')
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

router.get('/admin', auth.ensureAuthenticated, function (req, res) {
    BotConfig.find({})
        .sort('-created_at')
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

router.get('/admin/forms/:bot', auth.ensureAuthenticated, function (req, res) {
    bot = req.params.bot;
    res.render('botconfig/forms/' + bot, {});
});

router.post('/add', auth.ensureAuthenticated, function (req, res) {

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
            case 'haas': botcfg = fillHaasCfg(req);
            break;
            case 'gekko': botcfg = fillGekkoCfg(req);
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

// Update Submit POST Route
router.post('/edit/:id', auth.ensureAuthenticated, function (req, res) {
    let botcfg = {};
    // botcfg.name = req.body.name;
    // botcfg.bot = req.body.bot;
    botcfg.preview = req.body.preview;
    botcfg.body = req.body.body;

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
router.get('/delete/:id', auth.ensureAuthenticated, function (req, res) {
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
router.get('/:id', auth.ensureAuthenticated, function (req, res) {
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

function fillHaasCfg(req) {

    let botcfg = new BotConfig();

    let mh_min_pr_c2b = req.body.mh_min_pr_c2b ? 'on' : 'off';
    let bbs_r_fcc = req.body.bbs_r_fcc ? 'on' : 'off';
    let bbs_res_middle = req.body.bbs_res_middle ? 'on' : 'off';
    let bbs_al_mid_sells = req.body.bbs_al_mid_sells ? 'on' : 'off';

    botcfg.author = req.user._id;
    botcfg.name = req.body.cfg_name;
    botcfg.bot = req.body.bot;
    botcfg.market = req.body.market;
    botcfg.preview = req.body.preview;
    botcfg.body =
        '<h3>Trade amount settings</h3> \r\n'
        + '# Coin position: <b>' + req.body.coin_pos + '</b>\r\n'
        + '# Trade amount: <b>' + req.body.ta + '</b>\r\n'
        + '# Template: <b>' + req.body.template + '</b>\r\n'
        + '# Fee: <b>' + req.body.fee + '</b>\r\n\r\n'

        + '<h3>Mad hatter mode</h3> \r\n'
        + '# Min Price Change To Buy: <b>' + mh_min_pr_c2b + '</b>\r\n\r\n'

        + '<h3>Safety settings</h3> \r\n'
        + '# Min Price Change To Buy: <b>' + req.body.ss_min_pr_c2b + '</b>\r\n'
        + '# Min Price Change To Sell: <b>' + req.body.ss_min_pr_c2s + '</b>\r\n'
        + '# Stop Loss (%): <b>' + req.body.stoploss + '</b>\r\n\r\n'

        + '<h3>Bollinger Bands Settings</h3> \r\n'
        + '# Length: <b>' + req.body.bbs_length + '</b>\r\n'
        + '# Dev.up: <b>' + req.body.bbs_devup + '</b>\r\n'
        + '# Dev.down: <b>' + req.body.bbs_devdown + '</b>\r\n'
        + '# MA Type: <b>' + req.body.bbs_matype + '</b>\r\n'
        + '# Deviation: <b>' + req.body.bbs_deviation + '</b>\r\n'
        + '# Require FCC: <b>' + bbs_r_fcc + '</b>\r\n'
        + '# Reset middle <b>' + bbs_res_middle + '</b>\r\n'
        + '# Allow mid sells <b>' + bbs_al_mid_sells + '</b>\r\n\r\n'

        + '<h3>RSI settings</h3> \r\n'
        + '# Length: <b>' + req.body.rsi_length + '</b>\r\n'
        + '# Buy Level: <b>' + req.body.rsi_b_lev + '</b>\r\n'
        + '# Sell Level: <b>' + req.body.rsi_s_lev + '</b>\r\n\r\n'

        + '<h3>MACD settings</h3> \r\n'
        + '# MACD Fast: <b>' + req.body.macd_fast + '</b>\r\n'
        + '# MACD Slow: <b>' + req.body.macd_slow + '</b>\r\n'
        + '# MACD Signal: <b>' + req.body.macd_signal + '</b>';

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