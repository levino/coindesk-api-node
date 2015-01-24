var coindeskapi = require('./index.js');
var CoinDeskAPI = new coindeskapi();

CoinDeskAPI.getPrices('2010-07-17', '2011-07-17', 'USD', function(err, result) {
    console.log(result);
});