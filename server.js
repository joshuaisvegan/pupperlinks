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
    console.log("its on")
    res.sendFile(__dirname+ '/index.html');
})


app.listen(8081);
