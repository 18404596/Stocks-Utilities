var express = require('express')
var router = express.Router()
var request = require('request')
var cheerio = require('cheerio')

// Getting HK stock price
router.get('/hk/:id', function (req, res, next) {
  const stockId = padToFour(req.params.id)
  // Scrapping yahoo finance as a API to get the stock price
  const url = `https://finance.yahoo.com/quote/${stockId}.HK`
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      res.status(500).send('Some error happen on fetching data.')
    } else {
      const price = extractStockPriceFromYahooFinance(body)
      if (price) {
        res.send(String(price))
      } else {
        res.status(404).send('Fail to extact the stock price.')
      }
    }
  })
})

// Getting US stock price
router.get('/us/:id', function (req, res, next) {
  const stockId = req.params.id
  // Scrapping yahoo finance as a API to get the stock price
  const url = `https://finance.yahoo.com/quote/${stockId}`
  request(url, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      res.status(500).send('Some error happen on fetching data.')
    } else {
      const price = extractStockPriceFromYahooFinance(body)
      if (price) {
        res.send(String(price))
      } else {
        res.status(404).send('Fail to extact the stock price.')
      }
    }
  })
})

/**
 * Extract stock price from yahoo finance HTML raw data
 * @param {string} body
 */
function extractStockPriceFromYahooFinance (body) {
  const $ = cheerio.load(body)
  const holder = $('#quote-header-info span[data-reactid="35"]')
  const price = extractStockPrice(holder.html())
  if (price) {
    return (price)
  }
  return false
}

/**
 * Pad integer to 4 digits by padding zero on left
 * @param {integer} number
 */
function padToFour (number) {
  if (number <= 9999) { number = ('000' + number).slice(-4) }
  return number
}

/**
 * Extract the stock price from HTML raw data
 * @param {integer} str
 */
function extractStockPrice (str) {
  const regex = /\d+\.\d+/g
  const m = regex.exec(str)
  if (m !== null && typeof m[0] !== 'undefined') {
    return parseFloat(m[0])
  }
  return false
}

module.exports = router
