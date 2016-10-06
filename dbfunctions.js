const pg = require('pg');
const functions = require('./functions.js');
const url = require('url');


var databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl){
    databaseUrl = 'postgres://' + require('./credentials').pgUser + ':' + require('./credentials').pgPassword + '@localhost:5432/users';
}


var exports = module.exports = {};

//register-------------------------------------------------------------------------------


exports.register = function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var client = new pg.Client(databaseUrl);
    client.connect(function (err) {
        if (err){
            throw err;
        }
        functions.hashPassword(req.body.password, function(err, hash) {
            if (err) {
                console.log(err);
            }
            var query = "INSERT INTO usersLinks(name, email, hash) VALUES($1, $2, $3) RETURNING id"
            client.query(query, [name, email, hash], function(err, results) {
                if (err) {
                    console.log(err);

                    var duplicateEmailError = ['Email exists in a database'];

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
}

//login------------------------------------------------------------------------------------------

exports.login = function (req, res) {

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
                functions.checkPassword(req.body.password, results.rows[0].hash, function (err, doesMatch) {
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
}

//post links ----------------------------------------------------------------------------------------

exports.postlinks = function (req, res) {
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
}

//

exports.postcomments = function (req, res) {

    if (!req.session.user) {
        res.redirect('/comments/:id');
    } else if (!req.body.comment){

        res.sendStatus(403);
        return;

    } else {

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

                            var query = "SELECT userslinks.name, comments.id, comments.parent_id, comments.user_id, comments.comment, comments.timestamp, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id JOIN userslinks ON userslinks.id = comments.user_id WHERE comments.link_id = $1 ORDER BY comments.timestamp DESC;";

                            client.query(query, [req.body.id], function (err, results) {
                                if (err) {
                                    console.log(err);
                                } else {

                                    var list = functions.transformResultsIntoLinkedList(results);

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

                            var query = "SELECT userslinks.name, comments.id, comments.parent_id, comments.user_id, comments.comment, comments.timestamp, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id JOIN userslinks ON userslinks.id = comments.user_id WHERE comments.link_id = $1 ORDER BY comments.timestamp DESC;";

                            client.query(query, [req.body.id], function (err, results) {
                                if (err) {
                                    console.log(err);
                                } else {

                                    var list = functions.transformResultsIntoLinkedList(results);

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
    }
}

exports.getLinksAndLikes = function (req, res) {

    var client = new pg.Client(databaseUrl);
    client.connect(function (err) {
        if (err){
            throw err;
        }

        var query = "SELECT links.id, links.link, links.userid, links.content, links.timestamp, userslinks.name FROM links, userslinks WHERE links.userid = userslinks.id;";
        client.query(query, function(err, results) {

            client.end();

            if (err) {
                console.log(err);

            } else {

                for (var row in results.rows) {
                    results.rows[row].timestamp = results.rows[row].timestamp.toString();
                }

                var likePromises = results.rows.map(function(row) {

                    return getLikeCount(row.id).then(function (count) {
                        row.likes = count;
                    })
                })

                function getLikeCount(id) {

                    return new Promise(function (resolve, reject) {
                        var client1 = new pg.Client(databaseUrl);

                        client1.connect(function (err) {

                            if (err) {
                                throw err;
                            }
                            var query1 = "SELECT count(*) FROM likes WHERE linkid = $1;";

                            client1.query(query1, [id], function (err, results) {
                                client1.end();

                                if(err) {
                                    console.log(err)
                                    return reject(err);
                                } else {
                                    resolve(results.rows[0])
                                }
                            })
                        })
                    })
                }

                Promise.all(likePromises).then(function() {
                    console.log(results.rows)

                    res.json({

                        data: results.rows

                    });
                });
            }
        });
    });
};

exports.getComments = function (req, res) {

    var client = new pg.Client(databaseUrl);
    client.connect(function(err) {
        if (err){
            throw err;
        }

        var query = "SELECT userslinks.name, comments.id, comments.parent_id, comments.user_id, comments.comment, comments.timestamp, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id JOIN userslinks ON userslinks.id = comments.user_id WHERE comments.link_id = $1 ORDER BY comments.timestamp DESC;";

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

                var list = functions.transformResultsIntoLinkedList(results);

                client.end();

                res.json({
                    data: list
                });
            }
        });
    });
};

exports.postReply = function (req, res) {
    if (!req.session.user && !req.body.id) {
        res.redirect('/comments/:id');
        return;
    }

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

                    var query1 = "SELECT userslinks.name, comments.id, comments.parent_id, comments.user_id, comments.comment, comments.timestamp, links.link, links.content FROM comments JOIN links ON links.id = comments.link_id JOIN userslinks ON userslinks.id = comments.user_id WHERE comments.link_id = $1 ORDER BY comments.timestamp DESC;";

                    client1.query(query1, [req.body.linkId], function (err, results) {
                        if (err) {
                            console.log(err);
                        } else {

                            var list = functions.transformResultsIntoLinkedList(results);
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
};
