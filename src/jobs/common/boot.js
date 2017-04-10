'use strict'
const coHander = require('src/common/co-handler')

const Crawler = require('src/models/Crawler')

class Boot {
  constructor (config) {
    this.config = config
  }

  init () {
    const self = this

    return coHander(function * () {
      switch (self.config.strategy) {
        case 'restart': {
          yield Crawler.remove({}).exec()
          const crawler = new Crawler({
            website: self.config.website,
            jobStatus: self.config.jobStatus
          })
          yield crawler.save()
          break
        }
        case 'continue': {
          let crawler = yield Crawler.findOne({
            website: self.config.website
          })
          .exec()

          if (!crawler) {
            crawler = new Crawler({
              website: self.config.website,
              jobStatus: self.config.jobStatus
            })
            yield crawler.save()
          }
          break
        }
      }
    })
  }

  start () {
    return Promise.resolve()
  }
}

module.exports = Boot
