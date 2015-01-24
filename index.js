var request = require('request'),
    _ = require('underscore');

var CoinDeskAPI = function CoinDeskAPI(options) {
    this.options = options || { }
};

CoinDeskAPI.prototype.getPrices = function(from, to, currency, callback) {
    if (from > to) {
        callback(new Error('To date is before from date.'), []);
        return;
    }
    if (Date.parse(from) < Date.parse('2010-07-17')) {
            //prevention of bad requests to coindesk. They only have data from '2010-07-17'.
            from = '2010-07-17';
    }
    var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start=' + from + '&end=' + to + '&currency=' + currency;
    request.get({uri: url}, function (err, response, body) {
            if (err) {
                callback(err, {});
            }
            if (body) {
                var ratesValues = JSON.parse(body),
                    exchangeRatesCurrency = ratesValues.bpi;

                var resultArray = _.map(exchangeRatesCurrency, function (key, item) {
                    return {time: (Date.parse(item)), rate: key};
                });
                callback({}, resultArray);
            }
        });
};

module.exports = CoinDeskAPI;