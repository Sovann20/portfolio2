var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert'); //for testing purposes
var url = 'mongodb://localhost:27017';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Login'});
});

router.get('/signup', function (req, res, next) {
    res.render('signup', {title: 'Sign up'});
});

module.exports = router;
