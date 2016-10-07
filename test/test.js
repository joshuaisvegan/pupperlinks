var functions = require('../functions.js');
var assert = require('assert');


describe('Length of children in the object ', function() {
    it('should return 2', function () {
        assert.equal(2, functions.transformResultsIntoLinkedList({rows:[{"name":"a","id":23,"parent_id":19,"user_id":1,"comment":"new","timestamp":"2016-10-06T15:08:40.000Z","link":"https://www.bitcoinmining.com/bitcoin-mining-hardware/","content":"bitcoin"},{"name":"a","id":22,"parent_id":21,"user_id":1,"comment":"reply to sec","timestamp":"2016-10-06T15:08:28.000Z","link":"https://www.bitcoinmining.com/bitcoin-mining-hardware/","content":"bitcoin"},{"name":"a","id":21,"parent_id":null,"user_id":1,"comment":"second","timestamp":"2016-10-06T15:08:22.000Z","link":"https://www.bitcoinmining.com/bitcoin-mining-hardware/","content":"bitcoin"},{"name":"a","id":20,"parent_id":19,"user_id":1,"comment":"reply","timestamp":"2016-10-06T15:08:08.000Z","link":"https://www.bitcoinmining.com/bitcoin-mining-hardware/","content":"bitcoin"},{"name":"a","id":19,"parent_id":null,"user_id":1,"comment":"first","timestamp":"2016-10-06T15:05:57.000Z","link":"https://www.bitcoinmining.com/bitcoin-mining-hardware/","content":"bitcoin"}]}).length);
    });
});
