'use strict'
const debug = require('debug')('debug')
const cheerio = require('cheerio')
const {format} = require('util')

const coHandler = require('src/common/co-handler')
const PostNumber = require('src/models/instance/chinaJob/ChinaJobPostNumber')
const Detail = require('src/models/instance/chinaJob/ChinaJobDetail')
const CommonJob = require('src/jobs/instance/chinaJob/common/CommonJob')
const ERROR = require('src/consts/errors.js')
const JobConst = require('src/consts/chinaJob')

const NumberService = require('src/services/chinaJob/NumberService')

class GetDetail extends CommonJob {
  constructor (config) {
    super(config)
    this.config = config
  }

  init () {
    const self = this

    return coHandler(function * () {
      switch (self.config.strategy) {
        case 'restart':
          yield Detail.remove({
            location: self.config.location
          })
          .exec()
          break
        case 'continue':
          yield PostNumber.update({
            location: self.config.location,
            crawlStatus: JobConst.CRAWL_STATUS[1]
          }, {
            $set: {
              crawlStatus: JobConst.CRAWL_STATUS[0]
            }
          }, {
            multi: true
          })
          .exec()
          break
        default:
          throw new Error(format(ERROR.INVALID_STRATEGY, self.config.strategy))
      }
    })
  }

  start () {
    let self = this

    return coHandler(function * () {
      let postNumber

      try {
        while (true) {
          console.log(self.config.location)
          // postNumber = yield NumberService.getOneUncrawledAndUpdateStatus(self.config.location)
          postNumber = yield PostNumber.findOne({location: self.config.location, crawlStatus: JobConst.CRAWL_STATUS[0] }).exec()

         // 找不到未爬取的连接，有两种可能性。1：目前已有的连接已经爬取完毕，但还会有后续的连接被插入等待爬取。2：所有连接爬取完毕，不会有后续的连接等待被插入。
          if (!postNumber) {
            console.log(`no postNuber existing...`)
            const done = yield self.dependencyDone()

            if (done) {
              yield self.finish()
            } else {
              continue
            }
          }

         // yield postNumber.update({}, {crawlStatus: JobConst.CRAWL_STATUS[1]}).exec()
          postNumber.crawlStatus = JobConst.CRAWL_STATUS[1]
          yield postNumber.save()
          // debug('postNumber' + postNumber.number)
          console.log(`postNumber: ${postNumber}`)

          let url = format(self.config.detailPageBase, postNumber.number)
          console.log('detail page url: ' + url)
          let html = yield self.getHTML(url, 'jobPost')
          let $ = cheerio.load(html)

          let jobBody = $('#__01>tbody>tr:nth-child(2)>td').html().trim()
          let postDate = jobBody.match(/Publish Date<\/b>(.+?)<\/td><td><b>School Province/)[1].trim().replace(/[&nbsp;:#xA0]/g, '')
          // console.log(`jobBody IS ${jobBody}`)
          let existDetail = yield Detail.findOne({content: jobBody}).exec()

          if (!existDetail) {
            debug(`href hasn't been crawled. crawling..`)
            let option = {
              title: postNumber.title,
              content: jobBody,
              date: postDate
            }
            let detail = new Detail(option)
            yield detail.save()

            postNumber.crawlStatus = JobConst.CRAWL_STATUS[2]
            yield postNumber.save()
          }

          debug(`href is already been crawled. skiping..`)
          continue
        }
      } catch (e) {
        postNumber.crawlStatus = JobConst.CRAWL_STATUS[0]
        yield postNumber.save()
        throw e
      }
    })// END OF coHandler
  } // END OF START

  dependency () {
    return 'GetPostNumber'
  }
}

module.exports = GetDetail
