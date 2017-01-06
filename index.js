var request = require('request')
const _ = require('underscore')
const async = require('async')

var CoinDeskAPI = function CoinDeskAPI () {}

var baseUrl = 'http://api.coindesk.com/v1/bpi/'

/**
 * Returning a list of all currently "supported" (attention, querys will fail for some currencies
 * from this list as an array of three letter strings.
 * @param callback
 */
CoinDeskAPI.prototype.supportedCurrencies = function (callback) {
  var url = baseUrl + 'supported-currencies.json'
  request.get({uri: url}, function (err, response, body) {
    if (err) {
      callback(err, null)
    }
    if (body) {
      var currencies = JSON.parse(body)
      var currencyCodeArray = _.map(currencies, function (item) {
        return item['currency']
      })
      callback(null, currencyCodeArray)
    }
  })
}
/**
 * Calling the callback on an array of objects of the format: {time, rate} where rate is a float and time is in milliseconds.
 * @param from
 * @param to
 * @param currency
 * @param callback
 */
CoinDeskAPI.prototype.getPricesForSingleCurrency = function (from, to, currency, callback) {
  if (from > to) {
    callback(new Error('To date is before from date.'), [])
    return
  }
  if (Date.parse(from) < Date.parse('2010-07-17')) {
    // prevention of bad requests to coindesk. They only have data from '2010-07-17'.
    from = '2010-07-17'
  }
  var url = 'http://api.coindesk.com/v1/bpi/historical/close.json?start=' + from + '&end=' + to + '&currency=' + currency

  request.get({uri: url}, function (err, response, body) {
    if (err) {
      callback(err, null)
    }
    if (body) {
      var ratesValues = JSON.parse(body)
      const exchangeRatesCurrency = ratesValues.bpi

      var resultArray = _.map(exchangeRatesCurrency, function (key, item) {
        return {time: (Date.parse(item) + 86400000), rate: key}
      })
      callback(null, resultArray)
    }
  })
}

CoinDeskAPI.prototype.getPricesForMultipleCurrencies = function (from, to, currencies, callback) {
  var self = this
  var ratesWithTimes = {}
  var allRates = {}
  async.each(currencies,
    // 2nd param is the function that each item is passed to
    function (currency, callback) {
      // Call an asynchronous function, often a save() to DB
      self.getPricesForSingleCurrency(from, to, currency, function (err, result) {
        if (err) {
          callback(err)
        } else {
          ratesWithTimes[currency] = result
          callback()
        }
      })
    },
    // 3rd param is the function to call when everything's done
    function (err) {
      if (err) {
        callback(err, null)
      }
      _.each(ratesWithTimes, function (rates, currency) {
        rates.forEach(function (timeratepair) {
          var newEntry = {}
          newEntry[currency] = timeratepair.rate
          if (allRates[timeratepair.time]) {
            allRates[timeratepair.time].push(newEntry)
          } else {
            allRates[timeratepair.time] = [newEntry]
          }
        })
      })
      var allRatesNice = []
      _.each(allRates, function (rates, time) {
        var ratesNice = {}
        _.each(rates, function (currencyratepair) {
          _.each(currencyratepair, function (rate, currency) {
            ratesNice[currency] = rate
          })
        })
        allRatesNice.push({time: time, rates: ratesNice})
      })
      callback(null, allRatesNice)
    }
  )
}

/**
 * Currenlty broken. Coindesk does not support all currency that are returned by the according query.
 * @param from
 * @param to
 * @param currencies
 * @param callback
 */
/*
CoinDeskAPI.prototype.getPricesForAllCurrencies = function(from, to, currencies, callback) {
  var self = this
    self.supportedCurrencies(function(err, currencies) {
        if (err) {
            callback(err, null)
        }
        self.getPricesForMultipleCurrencies(from, to, currencies, callback)
    })
}
*/

module.exports = CoinDeskAPI
