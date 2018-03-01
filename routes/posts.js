const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

// Post Model
let Post = require('../models/post');
// User Model
let User = require('../models/user');

router.get('/all', function (req, res) {
    res.redirect('/posts/all/page/1')
});


router.get('/all/page/:id', function (req, res) {

    Post.paginate({}, {page: req.params.id, sort: '-created_at'}).then(function (result, err) {
        if (!err) {

            console.log(result.pages);

            let pagesarr = [];
            for(let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('post/allposts', {
                allposts: result.docs,
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
router.get('/add', auth.ensureAuthenticated, function (req, res) {
    Post.find({})
        .sort('-created_at')
        .exec(function (err, posts) {
            if (err) {
                console.log(err);
            } else {
                res.render('post/add_post', {
                    title: 'My posts',
                    user: req.user,
                    posts: posts
                });
            }
        });
});

// Add Submit POST Route
router.post('/add', function (req, res) {
    req.checkBody('caption', 'Caption is required').notEmpty();
    req.checkBody('preview', 'Preview is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('post/add_post', {
            title: 'Add Post',
            errors: errors
        });
    } else {
        let post = new Post();
        post.caption = req.body.caption;
        post.author = req.user._id;
        post.preview = req.body.preview;
        post.text = req.body.text;

        post.save(function (err) {
            if (err) {
                return console.log(err);
            } else {
                req.flash('success', 'Post Added');
                res.redirect('/');
            }
        });
    }
});

// Load Edit Form
router.get('/edit/:id', auth.ensureAuthenticated, function (req, res) {

    Post.findById(req.params.id, function (err, post) {
        if (err) {
            return console.log(err)
        } else if (!(req.user._id.equals(post.author)) || !(req.user.login === 'admin')) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        } else {
            res.render('post/edit_post', {
                title: 'Edit Post',
                post: post
            });
        }
    });
});

// Update Submit POST Route
router.post('/edit/:id', function (req, res) {
    let post = {};
    post.caption = req.body.caption;
    post.author = req.user._id;
    post.preview = req.body.preview;
    post.text = req.body.text;

    let query = {_id: req.params.id};

    Post.update(query, post, function (err) {
        if (err) {
            return console.log(err);
        } else {
            req.flash('success', 'Post Updated');
            res.redirect('/posts/add');
        }
    });
});

// Delete Post
router.get('/delete/:id', function (req, res) {
    Post.findById(req.params.id, function (err, post) {
        
        if (req.user._id.equals(post.author) || req.user.status === 4) {
            Post.findById(req.params.id).remove().exec(function (err, data) {
                if (!err) {
                    req.flash('success', 'Post Deleted');
                    res.redirect('/posts/add');
                }
            });
        } else {
            res.status(500).send();
        }
    });
});

// Get Single Post
router.get('/:id', function (req, res) {
    Post.findById(req.params.id, function (err, post) {
        if (post) {
            User.findById(post.author, function (err, user) {
                if (err) {
                    res.status(500).send();
                } else {
                    res.render('post/post', {
                        username: user.name,
                        post: post
                    });
                }
            });
        }
        else res.status(500).send();
    });
});

module.exports = router;