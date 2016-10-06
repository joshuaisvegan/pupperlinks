const express = require('express');
const app = express();
const pg = require('pg');
const cookieSession = require('cookie-session');
var csrf = require('csurf');
const hb = require('express-handlebars');
const bcrypt = require('bcrypt');
const url = require('url');
var functions = require('./functions.js');
var dbfunctions = require('./dbfunctions.js');

var databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl){
    databaseUrl = 'postgres://' + require('./credentials').pgUser + ':' + require('./credentials').pgPassword + '@localhost:5432/users';
}

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send('something is wrong')
});


var checkStatus = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        return res.sendStatus(401);
    }
};

// app.engine('handlebars', hb.engine);
// app.set('view engine', 'handlebars');
//
app.use(require('body-parser').urlencoded({
    extended: false
}));

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));

app.use(express.static(__dirname + '/static'));
app.use(csrf());

app.get('/init', function(req, res, next) {
    if (!req.session.user) {
        res.json({
            'csrfToken': req.csrfToken()
        });
    } else {
        res.json({
            username: req.session.user.name,
            'csrfToken': req.csrfToken()

        });
    }
});

app.get('/', function(req, res, next) {

    res.sendFile(__dirname+ '/index.html');
});


app.post('/register', function (req, res) {
    dbfunctions.register(req, res);
});



app.get('/register', function(req, res, next) {
    res.sendFile(__dirname+ '/registration.html');
});



app.post('/login', function (req, res) {

    dbfunctions.login(req, res);
});

app.get('/logout', function (req, res) {

    req.session = null;
    res.redirect('/#main');

});

app.post('/post', checkStatus, function (req, res) {

    dbfunctions.postlinks(req, res);

});

app.get('/links', function (req, res) {

    dbfunctions.getLinksAndLikes(req, res);

});

app.get('/comments/:id', function(req, res) {

    dbfunctions.getComments(req, res);

});

app.post('/reply/:id', function(req, res) {

    dbfunctions.postReply(req, res);
    
})

app.post('/comments', function(req, res) {

    dbfunctions.postcomments(req, res);
});

app.post('/likes', function (req, res) {

    if (!req.session.user) {
        res.redirect('/links');
        return;
    }

    var userid = req.session.user.id;
    //var linkid = req.body....

    var client = new pg.Client(databaseUrl);
    client.connect(function(err) {

        if (err) {
            throw err;
        }
        var query = "INSERT INTO likes(linkid, userid) VALUES($1, $2) RETURNING id;";
        //client.query(query, [linkid, userid] function (err, results) {
        if (err) {
            console.log(err);
        } else {
            client.end();

            var client1 = new pg.Client(databaseUrl);
            client1.connect(function(err) {
                if (err) {
                    throw err;
                }
                var query1 = "SELECT * FROM likes;";
                client1.query(query1, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        client1.end();

                        res.json({
                            data: results.rows
                        });
                    }
                });
            });
        }
    });
});

app.listen(process.env.PORT || 8081);
