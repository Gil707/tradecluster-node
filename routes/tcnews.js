const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

// TcNews Model
let TcNews = require('../models/tcnews');
// User Model
let User = require('../models/user');

router.get('/all', function (req, res) {
    res.redirect('/tcnews/all/page/1')
});


router.get('/all/page/:id', function (req, res) {

    TcNews.paginate({}, {page: req.params.id, sort: '-createdAt'}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for (let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('tcnews/alltcnews', {
                alltcnews: result.docs,
                pagesarr: pagesarr,
                page_id: req.params.id
            });

        } else {
            console.log(err);
            res.end('Error');
        }
    });
});

// Add Route
router.get('/add', auth.ensureManager, function (req, res) {
    TcNews.find({})
        .sort('-createdAt')
        .exec(function (err, tcnews) {
            if (err) {
                console.log(err);
            } else {
                res.render('tcnews/add_tcnews', {
                    title: 'My tcnewss',
                    user: req.user,
                    tcnewsblock: tcnews
                });
            }
        });
});

// Add Submit POST Route
router.post('/add', auth.ensureManager, function (req, res) {
    req.checkBody('caption', 'Caption is required').notEmpty();
    req.checkBody('preview', 'Preview is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('tcnews/add_tcnews', {
            title: 'Add TcNews',
            errors: errors
        });
    } else {
        let tcnews = new TcNews();
        tcnews.caption = req.body.caption;
        tcnews.author = req.user._id;
        tcnews.preview = req.body.preview;
        tcnews.text = req.body.text;

        tcnews.save(function (err) {
            if (err) {
                return console.log(err);
            } else {
                req.flash('success', 'TcNews Added');
                res.redirect('/');
            }
        });
    }
});

// Load Edit Form
router.get('/edit/:id', auth.ensureManager, function (req, res) {

    TcNews.findById(req.params.id, function (err, tcnews) {
        if (err) {
            return console.log(err)
        } else {
            res.render('tcnews/edit_tcnews', {
                title: 'Edit TcNews',
                tcnews: tcnews
            });
        }
    });
});

// Update Submit POST Route
router.post('/edit/:id', auth.ensureManager, function (req, res) {
    let tcnews = {};
    tcnews.caption = req.body.caption;
    tcnews.author = req.user._id;
    tcnews.preview = req.body.preview;
    tcnews.text = req.body.text;

    let query = {_id: req.params.id};

    TcNews.update(query, tcnews, function (err) {
        if (err) {
            return console.log(err);
        } else {
            req.flash('success', 'TcNews Updated');
            res.redirect('/tcnews/add');
        }
    });
});

// Delete TcNews
router.get('/delete/:id', auth.ensureManager, function (req, res) {
    TcNews.findById(req.params.id).remove().exec(function (err, data) {
        if (!err) {
            req.flash('success', 'TcNews Deleted');
            res.redirect('/tcnewss/add');
        }
    });
});

// Get Single TcNews
router.get('/:id', auth.ensureAuthenticated, function (req, res) {
    TcNews.findById(req.params.id, function (err, tcnews) {
        if (tcnews) {
            User.findById(tcnews.author, function (err, user) {
                if (err) {
                    res.status(500).send();
                } else {
                    res.render('tcnews/tcnews', {
                        username: user.name,
                        tcnews: tcnews
                    });
                }
            });
        }
        else res.status(500).send();
    });
});

module.exports = router;