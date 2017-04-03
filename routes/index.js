var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert'); //for testing purposes

//Change below to whatever your database is called & your port.
var url = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Login'});
});

router.get('/signup', function (req, res, next) {
    res.render('signup', {title: 'Sign up'});
});

router.get('/home', function (req, res, next) {
   res.render('home');
});

router.post('/user_signup', function (req, res, next) {
    var user = {
        username: req.body.username,
        password: req.body.password
    }; //item to insert...

    mongo.connect(url, function (err, db) {
        assert.equal(null, err);

        var isValue = 1;
        db.collection('user-data').count({ 'user.username': user.username },
            function (err, count) {
            console.log("Count: " +count);
            // console.log("Username: "+ username);
            console.log("User.username: "+user.username);
        });
        // console.log("start: "+temp+" end");

        // var isValue = 1;

        if(isValue == 0) {
            db.collection('user-data').insertOne(user, function () {
                assert.equal(null, err);
                console.log("User inserted");
                db.close();
                res.redirect('/login');
            });
        } else {
            console.log("Username already exists!");
            res.render('signup');
        }
    });


});




router.get('/userLogin', function (req, res, next) {
    var resultArr = [];

    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        var cursor = db.collection('user-data').find({username : 'Sovann'});
        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            resultArr.push(doc);
        }, function () {
            db.close();
            res.render('login', {users: resultArr});
        });
    });
});

module.exports = router;
