var CoinDeskAPI = require('./index.js')
var coinDeskAPI = new CoinDeskAPI()
/*
CoinDeskAPI.getPricesForSingleCurrency('2010-07-17', '2010-07-19', 'USD', function(err, result) {
    if (err) {
        console.log(err)
    } else {
        console.log(result)
    }
})
CoinDeskAPI.supportedCurrencies(function(err,result){
    console.log(result)
})
*/
coinDeskAPI.getPricesForMultipleCurrencies('2010-07-17', '2011-07-19', ['USD', 'EUR'], function (err, result) {
  if (err) {
    console.log(err)
  } else {
    console.log(result)
  }
})
