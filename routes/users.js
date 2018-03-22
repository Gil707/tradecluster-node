const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const recaptcha = require('recaptcha').Recaptcha;

const auth = require('../components/auth');

let User = require('../models/user');
let Order = require('../models/order');

/* GET users listing. */

router.get('/', auth.ensureManager, function (req, res, next) {
        return next;
});

router.get('/all', auth.ensureManager, function (req, res, next) {
        res.redirect('/users/all/page/1');
});

router.get('/all/page/:id', auth.ensureManager, function (req, res) {

        User.paginate({}, {page: req.params.id, sort: '-createdAt'}).then(function (result, err) {
            if (!err) {

                let pagesarr = [];
                for (let i = 1; i <= result.pages; i++) {
                    pagesarr.push(i)
                }

                res.render('users/list', {
                    users: result.docs,
                    pagesarr: pagesarr,
                    page_id: req.params.id
                });

            } else {
                console.log(err);
                res.end('Error');
            }
        });
});

// Get Single User
router.get('/view/:id', auth.ensureManager, function (req, res) {
    User.findById(req.params.id, function (err, userProfile) {
        if (err) {
            res.status(500).send();
        } else {
            Order.find()
                .where({user_id: req.params.id})
                .sort('-createdAt')
                .exec(function (err, orders) {
                    if (err) {
                        res.status(500).send();
                    } else {
                        res.render('users/view', {
                            userProfile: userProfile,
                            orders: orders
                        });
                    }
                });

        }
    });
});

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/signup', function (req, res, next) {

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('login', 'Login is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();

    if (errors) {
        res.render('signup', {
            errors: errors
        });
    } else {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            login: req.body.login,
            password: req.body.password,
            phone: req.body.phone
        });

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        req.flash('error', 'The same data already added');
                        res.render('signup', {
                            errors: errors
                        });
                    } else {
                        req.flash('success', 'You are now registered and can log in');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});

// Login Form
router.get('/login', function (req, res) {
    res.render('login');
});

// Login Process
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// logout
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;
