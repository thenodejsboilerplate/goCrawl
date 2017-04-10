'use strict'
const coHandler = require('src/common/co-handler')
const Common = require('src/classes/CommonJob')
const cheerio = require('cheerio')
const logger = require('src/common/bunyanLogger')
const nightmare = require('src/common/nightmare')
// const specCommonJob = require('src/jobs/chinajob/common/CommonJob')

class CommonJob extends Common {
  constructor (config) {
    super(config)
    this.config = config
  }
  
  getCount (url) {
    let self = this
    return coHandler(function * () {
      let res = {}
      const html = yield self.getHTML(url, 'postList')
      const $ = cheerio.load(html)
      res.totalPageCount = $('#LblTotaltPage').text().trim()
      res.postCount = $('#LblTotalInfos').text().trim()
      return Promise.resolve(res)
    })
  }


  getHTML (url, which) {
    // const self = this
    let selector
    if (which === 'postList') {
      selector = '.cn_txtlan1'
    } else if (which === 'postDetail') {
      selector = '#form1'
    }
    return coHandler(function * () {
      let html
      try {
        html = yield nightmare
                  .goto(url)
                  .exists(selector)
                  .evaluate(function () {
                    return document.getElementsByTagName('body')[0].innerHTML
                  })
      } catch (e) {
        logger.error(`cannot get html:${e}`)
        return Promise.reject(e)
      }
      return Promise.resolve(html)
    })
  }
}

module.exports = CommonJob
