'use strict'
const { format } = require('util')
const SfdaErrors = require('src/consts/errors')
const Crawler = require('src/models/Crawler')
const coHandler = require('src/common/co-handler')
const logger = require('src/common/bunyanLogger')

class CommonJob {
  constructor (config) {
    this.config = config
  }

  finish () {
    const self = this

    return coHandler(function * () {
      const crawler = yield self.getCrawler()

      crawler.jobStatus = Object.assign({}, crawler.jobStatus, {
        [self.constructor.name]: true
      })
      yield crawler.save()
    })
  }

  dependency () {
    return ''// should be a class
  }

  dependencyDone () {
    const self = this

    return coHandler(function * () {
      const crawler = yield self.getCrawler()

      if (!crawler) {
        throw new Error(format(SfdaErrors.CAN_NOT_FIND_CRAWLER_ON_DATABASE, self.config.website, self.config.location))
      }

      return crawler.jobStatus[self.dependency()]
    })
  }

  getCrawler () {
    const self = this

    return coHandler(function * () {
      const crawler = yield Crawler.findOne({
        website: self.config.website,
       // location: self.config.location
      })
     .exec()

      if (!crawler) {
        throw new Error(format(SfdaErrors.CAN_NOT_FIND_CRAWLER_ON_DATABASE, self.config.website, self.config.website))
      }

      return Promise.resolve(crawler)
    })
  }
}

module.exports = CommonJob
