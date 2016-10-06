var bcrypt = require('bcrypt');


var exports = module.exports = {};


exports.hashPassword = function (plainTextPassword, callback) {
    bcrypt.genSalt(function(err, salt) {
        if (err) {
            return callback(err);
        }
        console.log(salt);
        bcrypt.hash(plainTextPassword, salt, function(err, hash) {
            if (err) {
                return callback(err);
            }
            console.log(hash);
            callback(null, hash);
        });
    });
}

exports.checkPassword = function (textEnteredInLoginForm, hashedPasswordFromDatabase, callback) {
    bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
        if (err) {
            return callback(err);
        }
        console.log(doesMatch);
        callback(null, doesMatch);
    });
}

exports.transformResultsIntoLinkedList = function (results) {

    var comments = results.rows;

    var nodes = [];
    var toplevelNodes = [];
    var lookupList = {};

    for (var i = 0; comments[i]; i++) {
        var n = {
            name: comments[i].name,
            id: comments[i].id,
            parent_id: ((comments[i].parent_id == null) ? null : comments[i].parent_id),
            children: [],
            user_id: comments[i].user_id,
            comment: comments[i].comment,
            timestamp: comments[i].timestamp.toString(),
            link: comments[i].link,
            content: comments[i].content
        };
        lookupList[n.id] = n;
        //console.log(comments[i].timestamp, Object.prototype.toString.call(comments[i].timestamp))
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
