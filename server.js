const express = require('express');
const app = express();
const pg = require('pg');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const hb = require('express-handlebars');
const bcrypt = require('bcrypt');
const url = require('url');


var databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl){
    databaseUrl = 'postgres://' + require('./credentials').pgUser + ':' + require('./credentials').pgPassword + '@localhost:5432/users';
}

//
// app.use(function(req, res, next) {
//     req.method == 'GET' && res.setHeader('csrf-Token', req.csrf());
//     next();
//
// })

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send('something is wrong')
})


var transformResultsIntoLinkedList = function (results) {

    var comments = results.rows;

    var nodes = [];
    var toplevelNodes = [];
    var lookupList = {};

    for (var i = 0; comments[i]; i++) {
        var n = {
            id: comments[i].id,
            parent_id: ((comments[i].parent_id == null) ? null : comments[i].parent_id),
            children: [],
            user_id: comments[i].user_id,
            comment: comments[i].comment,
            timestamp: comments[i].timestamp,
            link: comments[i].link,
            content: comments[i].content
        };
        lookupList[n.id] = n;

        nodes.push(n);

        if (n.parent_id == null) {
            toplevelNodes.push(n);
        }
    }

    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!(n.parent_id == null)) {
            lookupList[n.parent_id].children = lookupList[n.parent_id].children.concat([n]);
        }
    }

    return toplevelNodes;

}

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


app.get('/init', function(req, res, next) {
    if (!req.session.user) {
        res.sendStatus(405);
    } else {
        res.json({
            username: req.session.user.id
        });
    }
});


app.get('/', function(req, res, next) {

    res.sendFile(__dirname+ '/index.html');
});

app.post('/register', function(req, res){

    var name = req.body.name;
    var email = req.body.email;
    var client = new pg.Client(databaseUrl);
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

                        id: results.rows[0].id,
                        email: email,
                        name: name
                    }
                    res.redirect('/#loggedinMain');
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

    var client = new pg.Client(databaseUrl);
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
                        var name = results.rows[0].name;
                        var id = results.rows[0].id;


                        req.session.user = {
                            id: id,
                            email: email,
                            name: name
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

app.get('/logout', function (req, res) {

    req.session = null;
    res.redirect('/#main');

})

app.post('/post', checkStatus, function (req, res) {
    //console.log(req.body.title)
    //console.log(req.session.user.id)

    if (url.parse(req.body.link).host == null) {
        res.sendStatus(403);
        return;
    }



    if (req.body.title.length >= 255) {
        res.sendStatus(405);
        return;
    }

    var headline = req.body.title,
        link = req.body.link,
        userid = req.session.user.id;


    if (!req.session.user) {

        res.sendStatus(403);

        console.log('error');
        return;
    } else {

        var client = new pg.Client(databaseUrl);
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
    }
});

app.get('/links', function (req, res) {

    var client = new pg.Client(databaseUrl);
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

app.get('/comments/:id', function(req, res) {

    var client = new pg.Client(databaseUrl);
    client.connect(function(err) {
        if (err){
            throw err;
        }

        var query = "SELECT comments.id, comments.parent_id, comments.user_id, comments.comment, comments.timestamp, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id WHERE comments.link_id = $1;";

        client.query(query, [req.params.id], function (err, results) {
            if (err) {
                console.log(err);
            } else {

                if (results.rows.length == 0) {

                    var clientN = new pg.Client(databaseUrl);
                    clientN.connect(function(err) {
                        if (err){
                            throw err;
                        }

                        var queryN = "SELECT * FROM links WHERE links.id = $1;"

                        clientN.query(queryN, [req.params.id], function (err, results) {
                            if (err) {
                                console.log(err);
                            } else {

                                res.json({
                                    data: results.rows
                                });
                            }
                        });
                    });
                    return;
                }

                var list = transformResultsIntoLinkedList(results);

                client.end();

                res.json({
                    data: list
                });
            }
        });
    });
});

app.post('/reply/:id', function(req, res) {

    var parent_id = req.body.id;

    var client = new pg.Client(databaseUrl);
    client.connect(function(err) {
        if (err){
            throw err;
        }

        var query = "INSERT INTO comments(parent_id, user_id, link_id, comment) VALUES($1, $2, $3, $4) RETURNING id;";
        client.query(query, [parent_id, req.session.user.id, req.body.linkId, req.body.reply], function (err, results) {
            if (err) {
                console.log(err);
            } else {

                var client1 = new pg.Client(databaseUrl);
                client1.connect(function(err) {
                    if (err){
                        throw err;
                    }

                    var query1 = "SELECT comments.id, comments.parent_id, comments.user_id, comments.comment, comments.timestamp, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id WHERE comments.link_id = $1;";

                    client1.query(query1, [req.body.linkId], function (err, results) {
                        if (err) {
                            console.log(err);
                        } else {

                            var list = transformResultsIntoLinkedList(results);
                            console.log(list);

                            client.end();
                            res.json({
                                data: list
                            });
                        }
                    });
                });
            }
        });
    });
})
app.post('/comments', function(req, res) {
    console.log(req.body)
    if (!req.body.comment) {
        res.sendStatus(403);
        return;
    }

    var client = new pg.Client(databaseUrl);
    client.connect(function(err) {
        if (err){
            throw err;
        }
        if (!req.body.parent_id) {

            var query = "INSERT INTO comments(user_id, link_id, comment) VALUES($1, $2, $3) RETURNING id;";
            console.log('no parent')
            client.query(query, [req.session.user.id, req.body.id, req.body.comment], function (err, results) {


                if (err) {
                    console.log(err);
                } else {

                    var client = new pg.Client(databaseUrl);
                    client.connect(function(err) {
                        if (err){
                            throw err;
                        }

                        var query = "SELECT comments.id, comments.parent_id, comments.user_id, comments.comment, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id WHERE comments.link_id = $1;";

                        client.query(query, [req.body.id], function (err, results) {
                            if (err) {
                                console.log(err);
                            } else {

                                var list = transformResultsIntoLinkedList(results);

                                client.end();
                                res.json({
                                    data: list
                                });
                            }
                        });
                    });
                }
            });

        } else {

            var query = "INSERT INTO comments(parent_id, user_id, link_id, comment) VALUES($1, $2, $3, $4) RETURNING id;";
            client.query(query, [req.body.parent_id, req.session.user.id, req.body.id, req.body.comment], function (err, results) {
                if (err) {
                    console.log(err);
                } else {

                    var client = new pg.Client(databaseUrl);
                    client.connect(function(err) {
                        if (err){
                            throw err;
                        }

                        var query = "SELECT comments.id, comments.parent_id, comments.user_id, comments.comment, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id WHERE comments.link_id = $1;";

                        client.query(query, [req.body.id], function (err, results) {
                            if (err) {
                                console.log(err);
                            } else {

                                var list = transformResultsIntoLinkedList(results);

                                client.end();
                                res.json({
                                    data: list
                                });
                            }
                        });
                    });
                }
            });
        }
    });
});

app.listen(process.env.PORT || 8081);
