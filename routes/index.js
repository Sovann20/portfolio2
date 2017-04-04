var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert'); //for testing purposes

//Change below to whatever your database is called & your port.
var url = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/login', function (req, res, next) {
    res.render('login');
});

router.get('/signup', function (req, res, next) {
    res.render('signup');
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
                        db.close();
                        res.redirect('/login');
                    });
                } else {
                    //Renders page w/ message
                    res.render('signup', {msg: "This username already exists! Try a new username."});
                }
            });
    });
});


router.post('/user_login', function (req, res, next) {
    var user = {
        username: req.body.username,
        password: req.body.password
    }; //item to insert...

    mongo.connect(url, function (err, db) {
        assert.equal(null, err);

        db.collection('user-data').count({username: user.username, password: user.password},
            function (err, count) {

                if (count > 0) {
                    db.close();
                    req.session.curr_user = user.username;
                    console.log("Session: " + req.session.curr_user);
                    res.redirect('/home');
                } else {
                    //Renders page w/ message
                    db.close();
                    res.render('login', {msg: "You have entered the wrong username or password!"});
                }
            });
    });
});

router.get('/home', function (req, res, next) {
    var resultArr = [];

    if (req.session.curr_user) {

        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            var cursor = db.collection('user-data').find();
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);

                resultArr.push(doc);
            }, function () {
                db.close();
                res.render('home', {users: resultArr, message: "Hello " + req.session.curr_user});
            });
        });
    } else {
        res.render('login', {msg: "You need to log in first!"});
    }

});

router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
    });

    res.render('index', {msg: "You've logged out!"});
});

router.post('/chat_area', function (req, res, next) {
    var chatArr = [];
    var parsed_info;
    var to = '';

    req.on('data', function (data) {
        to += data;

        parsed_info = to.slice(1, to.length - 1);

        //console.log("inside: "+parsed_info);

        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            db.collection('chat_log').count({
                    $or: [{user1: req.session.curr_user, user2: parsed_info},
                        {user1: parsed_info, user2: req.session.curr_user}]
                },
                function (err, count) {
                    if (count > 0) {
                        var cursor = db.collection('chat_log').find({
                            $or: [{user1: req.session.curr_user, user2: parsed_info},
                                {user1: parsed_info, user2: req.session.curr_user}]
                        });
                        cursor.forEach(function (doc, err) {
                            assert.equal(null, err);

                            chatArr.push(doc.chatLog);
                        }, function () {
                            res.send(chatArr[0]);
                        });
                    }
                    else {
                        res.send(null);
                    }

                });
        });
    });
});

router.post('/send_message', function (req, res, next) {

    req.on('data', function (data) {
        var da_data = JSON.parse(data);
        // console.log(da_data.to);
        // console.log(da_data.msg);

        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
            db.collection('chat_log').count({
                    $or: [{user1: req.session.curr_user, user2: da_data.to},
                        {user1: da_data.to, user2: req.session.curr_user}]
                },
                function (err, count) {
                    if (count > 0) {
                        // console.log("Database exists");
                        db.collection('chat_log').update(
                            {
                                $or: [{user1: req.session.curr_user, user2: da_data.to},
                                    {user1: da_data.to, user2: req.session.curr_user}]
                            },
                            {
                                $push: {
                                    chatLog: {
                                        "User": req.session.curr_user, "msg": da_data.msg
                                    }
                                }
                            }
                        )
                    }
                    else {
                        // console.log("Database does not exist");
                        db.collection('chat_log').insert({
                            "user1": req.session.curr_user,
                            "user2": da_data.to,
                            "chatLog": [
                                {
                                    "User": req.session.curr_user,
                                    "msg": da_data.msg
                                }
                            ]
                        })
                    }
                });
        });
    });
});

module.exports = router;
