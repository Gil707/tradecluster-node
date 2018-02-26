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

router.post('/add', auth.ensureAuthenticated, function (req, res) {

    req.checkBody('bot', 'Bot is required').notEmpty();
    req.checkBody('name', 'Name of config is required').notEmpty();
    req.checkBody('preview', 'Preview is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('botconfig/admin', {
            errors: errors
        });
    } else {

        let botcfg = new BotConfig();

        botcfg.author = req.user._id;
        botcfg.name = req.body.name;
        botcfg.bot = req.body.bot;
        botcfg.preview = req.body.preview;
        botcfg.body = req.body.body;
        botcfg.cost = req.body.cost;

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


module.exports = router;