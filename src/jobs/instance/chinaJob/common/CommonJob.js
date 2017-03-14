'use strict'
const coHandler = require('src/common/co-handler')
const CommonClass = require('src/classes/CommonJob')
const cheerio = require('cheerio')
const nightmare = require('src/common/nightmare')

class CommonJob extends CommonClass {
  constructor (config) {
    super(config)
    this.config = config
  }

  getCount (url) {
    // /const self = this
    return coHandler(function * () {
      let res = {}
      let html = yield nightmare
        .goto(url)
        .exists('form[name="common"]')
        .evaluate(function () {
          return document.getElementsByTagName('body')[0].innerHTML
        })

      const $ = cheerio.load(html)
      res.totalPageCount = $('.pagerselect>option:last-child').attr('value')
      res.postCount = $('tbody tr').text().match(/Total (\d+) Records/)[1]
      return Promise.resolve(res)
    })
  }

  getHTML (url, which) {
    // const self = this
    let selector
    if (which === 'jobPost') {
      selector = '#__01'
    } else if (which === 'postList') {
      selector = 'form[name="common"]'
    }
    return coHandler(function * () {
      let html = yield nightmare
        .goto(url)
        .exists(selector)
        .evaluate(function () {
          return document.getElementsByTagName('body')[0].innerHTML
        })
      return Promise.resolve(html)
    })
  }
  // next prototype methods
}

module.exports = CommonJob
