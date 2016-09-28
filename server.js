const express = require('express');
const app = express();
const pg = require('pg');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const hb = require('express-handlebars');
const credentials = require('./credentials');
const bcrypt = require('bcrypt');

// app.engine('handlebars', hb.engine);
// app.set('view engine', 'handlebars');
//
app.use(require('body-parser').urlencoded({
    extended: false
}));

var hashPassword = function (plainTextPassword, callback) {
    bcrypt.genSalt(function(err, salt) {
        if (err) {
            return callback(err);
        }

        bcrypt.hash(plainTextPassword, salt, function(err, hash) {
            if (err) {
                return callback(err);
            }

            callback(null, hash);
        });
    });
}

var checkPassword = function (textEnteredInLoginForm, hashedPasswordFromDatabase, callback) {
    bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
        if (err) {
            return callback(err);
        }
        console.log(doesMatch);
        callback(null, doesMatch);
    });
}

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res, next) {

    res.sendFile(__dirname+ '/index.html');
});

app.post('/register', function(req, res){

    var name = req.body.name;
    var email = req.body.email;
    var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
    client.connect(function (err) {
        if (err){
            throw err;
        }
        hashPassword(req.body.password, function(err, hash) {
            if (err) {
                console.log(err);
            }
            var query = "INSERT INTO usersLinks(name, email, hash) VALUES($1, $2, $3) RETURNING id"
            client.query(query, [name, email, hash], function(err, results) {
                if (err) {
                    console.log(err);

                    var duplicateEmailError = ['Email exists in a database'];

                    //res.render('index', {emailError: duplicateEmailError});

                } else {
                    client.end();

                    req.session.user = {

                        userID: results.rows[0].id,
                        email: email
                    }
                    res.redirect('/#main');
                }
            });
        });
    });
});

app.get('/register', function(req, res, next) {
    res.sendFile(__dirname+ '/registration.html');
});


app.post('/login', function (req, res) {


    if (!req.body.email.length || !req.body.password.length) {

        console.log('error');
    }

    var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
    client.connect(function (err) {
        if (err){
            throw (err);
        }
        var query = 'SELECT * FROM usersLinks WHERE usersLinks.email = $1';
        var email = req.body.email;

        client.query(query, [email], function (err, results) {

            if (!results.rows.length) {
                err = true;
            }
            if (err) {

                console.log(err)
            } else {
                client.end();
                checkPassword(req.body.password, results.rows[0].hash, function (err, doesMatch) {
                    if (err) {

                        console.log(err)
                    }
                    if (doesMatch == true) {
                        var id = results.rows[0].id;
                        req.session.user = {
                            email: email,
                            id: id
                        }
                        res.sendStatus(200);
                    } else {
                        console.log('wrong password/correct login')
                        console.log(err)
                    }
                });
            }
        });
    });
});

app.post('/post', function (req, res) {
    console.log(req.session)
    var headline = req.body.title,
        link = req.body.link,
        userid = 1;

    if (!req.body.link.length) {

        console.log('error');
        return;
    }

    var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
    client.connect(function (err) {
        if (err){
            throw err;
        }

        var query = "INSERT INTO links(link, userid, content) VALUES($1, $2, $3) RETURNING id"
        client.query(query, [link, userid, headline], function(err, results) {
            if (err) {
                console.log(err);

            } else {
                client.end();
                console.log('it works');


                res.sendStatus(200);
            }
        });
    });
});

app.get('/links', function (req, res) {


    // if (!req.body.length) {
    //
    //     console.log('error');
    //     return;
    // }

    var client = new pg.Client('postgres://' + credentials.pgUser + ':' + credentials.pgPassword + '@localhost:5432/users');
    client.connect(function (err) {
        if (err){
            throw err;
        }

        var query = "SELECT * FROM links"
        client.query(query, function(err, results) {

            if (err) {
                console.log(err);

            } else {
                client.end();

                res.json({

                    data: results.rows

                });
            }
        });
    });
})

app.get('/comments', function(req, res) {





    res.sendStatus(200);


})

app.listen(8081);
