const pg = require('pg');
const functions = require('./functions.js');


var databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl){
    databaseUrl = 'postgres://' + require('./credentials').pgUser + ':' + require('./credentials').pgPassword + '@localhost:5432/users';
}


var exports = module.exports = {};

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
