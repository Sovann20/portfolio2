var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert'); //for testing purposes

//Change below to whatever your database is called & your port.
var url = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'chatterBox'});
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

        db.collection('user-data').count({username: user.username},
            function (err, count) {
            //Checking if a user exists...
                if (count == 0) {
                    db.collection('user-data').insertOne(user, function () {
                        assert.equal(null, err);
                        console.log("User inserted");
                        db.close();
                        res.redirect('/login');
                    });
                    //If not lets redirect to the same page.
                } else {
                    //Renders page w/ message
                    res.render('signup', { msg: "This username already exists! Try a new username."});
                }
            });
    });


});


router.get('/userLogin', function (req, res, next) {
    var resultArr = [];

    mongo.connect(url, function (err, db) {
        assert.equal(null, err);
        var cursor = db.collection('user-data').find();
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
