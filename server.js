const express = require('express');
const app = express();
const pg = require('pg');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const hb = require('express-handlebars');

// app.engine('handlebars', hb.engine);
// app.set('view engine', 'handlebars');
//
// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2']
// }));


app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res, next) {

    res.sendFile(__dirname+ '/index.html');
});

app.post('/register', function(req, res){


    var client = new pg.Client("postgres://joshua:!nshallah@localhost:5432/users");
    client.connect(function (err) {
        if (err){
            throw err;
        }
        hashPassword(req.body.password).then(function(hash){
            var form1 = "INSERT INTO pupfans (name, email, password) VALUES ($1, $2, $3) RETURNING id";
            client.query(form1, [req.body.name, req.body.email, hash], function (err, result) {
                if (err){
                    throw err;
                }
                req.session.user = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                };

                res.end();
            });
        }).catch(function(err){
            if (err){
                console.log(err);
            }
        });
    });
});


app.listen(8081);
