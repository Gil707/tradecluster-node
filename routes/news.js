const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const rp = require('request-promise');
const cheerio = require('cheerio');

let News = require('../models/news');

router.get('/getcoindesk', function (req, res) {
    let options = {
        uri: 'https://www.coindesk.com/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(function ($) {
            let block = $('#content').children().first();

            let news = new News();

            news.title = block.find('a.standard-format-icon').attr('title');
            news.img = block.find('img.wp-post-image').attr('data-cfsrc');
            news.link = block.find('a.standard-format-icon').attr('href');
            news.preview = block.find('p').last().text();
            news.time = block.find('p').first().text();
            news.resource = 'coindesk.com';

            News.find({title: news.title}, function (err, docs) {
                if (err) {
                    return console.log(err);
                } else {
                    if (docs.length) {
                        res.end('reject');
                    } else {
                        news.save(function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                res.end('resolve');
                            }
                        });
                    }
                }
            });


        })
        .catch(function (err) {
            console.log(err)
        });
});

router.get('/getcryptopotato', function (req, res) {
    let options = {
        uri: 'https://cryptopotato.com/crypto-news/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(function ($) {
            let block = $('#list-items').children().first();

            let news = new News();

            news.title = block.find('a.image-link').attr('title');
            news.img = block.find('img.media-object').attr('src');
            news.link = block.find('a.image-link').attr('href');
            news.preview = block.find('div.entry-excerpt > p').text();
            news.time = block.find('span.entry-date > a').text() + ' ' + block.find('span.entry-time').text() + ' | ' + block.find('span.entry-user > a').text();
            news.resource = 'cryptopotato.com';

            News.find({title: news.title}, function (err, docs) {
                if (err) {
                    return console.log(err);
                } else {
                    if (docs.length) {
                        res.end('reject');
                    } else {
                        news.save(function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                res.end('resolve');
                            }
                        });
                    }
                }
            });


        })
        .catch(function (err) {
            console.log(err)
        });
});


module.exports = router;