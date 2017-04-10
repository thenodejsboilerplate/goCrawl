'use strict'
const debug = require('debug')('debug')
const {format} = require('util')
const nightmare = require('src/common/nightmare')
const cheerio = require('cheerio')
const coHandler = require('src/common/co-handler')

const PostNumber = require('src/models/instance/chinaJob/ChinaJobPostNumber')
const ChinaJobCount = require('src/models/instance/chinaJob/Count')
const CommonJob = require('src/jobs/instance/chinaJob/common/CommonJob')
const ERROR = require('src/consts/errors.js')

const JobConst = require('src/consts/chinaJob')
// const JobCountService = require('src/services/chinaJob/CountService')
const JobCount = require('src/models/instance/chinajob/Count')
class GetPostNumber extends CommonJob {
  constructor (config) {
    super(config)
    this.config = config
  }

  init () {
    const self = this

    return coHandler(function * () {
      switch (self.config.strategy) {
        case 'restart':
          yield PostNumber.remove({
            website: self.config.website
          })
          .exec()
          break
        case 'continue':
          yield PostNumber.update({
            website: self.config.website,
            crawlStatus: JobConst.CRAWL_STATUS[1]
          },
            {
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
    const self = this
    return coHandler(function * () {
      console.log('into start in chinajob getpstnumber')
      let url = 'http://www.chinajob.com/individual/my_teacherlist.php'//format(self.config.initUrl, 1)
      // console.log('above getcount fun; url' + url)
      // let count = yield self.getCount('http://www.chinajob.com/individual/my_teacherlist.php')
      // console.log('count is'+count)
      // let {postCount, totalPageCount} = yield self.getCount(url)

      const html = self.getHTML('http://www.chinajob.com/individual/my_teacherlist.php', 'postList')
      console.log('under html'+ html)

      const $ = cheerio.load(yield html)

      let totalPageCount = $('.pagerselect>option:last-child').attr('value').trim()
      let postCount = $('tbody tr').text().match(/Total (\d+) Records/)[1].trim()
      console.log(`totalPageCount: ${totalPageCount}`)



      // let cjCount = yield JobCountService.findOne({
      //   website: self.config.website
      // }).exec()
     

      let cjCount = yield JobCount.findOne({
        website: self.config.website
      }).exec()
      console.log('cjcount'+ cjCount)
      if (!cjCount) {
        cjCount = new ChinaJobCount({
          website: self.config.website,
          totalPageCount,
          postCount
        })
        yield cjCount.save()
      } else if (cjCount.postCount !== postCount) {
        cjCount.postCount = postCount
        cjCount.totalPageCount = totalPageCount
        cjCount.crawledPageCount = 0// ???
        yield cjCount.save()
      }

      // 从上次记录开始继续往下爬
      for (let pageNum = cjCount.crawledPageCount + 1; pageNum <= totalPageCount; pageNum++) {
        const url = format(self.config.initUrl, pageNum)
        const html = yield self.getHTML(url, 'postList')
        console.log('html:' + html)
        let $ = cheerio.load(html)

        let hrefEles = $('form a[onfocus="if(this.blur)this.blur()"]')
        if (hrefEles.length === 0) {
          throw new Error(format(ERROR.CAN_NOT_GET_ELEMENT, url))
        }

        hrefEles.each(function (i, v) {
          let that = $(this)
          coHandler(function * () {
            let title = that.text().trim()
            console.log('title' + title)
            let hrefString = that.attr('href').trim()
            let number = hrefString.match(/javascript:viewteacher\('(\d+)'\)/)[1]

            let hrefExist = yield PostNumber.findOne({number}).exec()

            if (!hrefExist) {
              let option = {
                website: self.config.website,
                number,
                title
                // doneRecord: true
              }
              let href = new PostNumber(option)
              yield href.save()
              console.log('next iteration..')
							// To break a $.each loop, you have to return false in the loop callback.Returning true skips to the next iteration, equivalent to a continue in a normal loop.
            }
            debug(`href number exist: ${number}`)
            return true
          })
        }) // end of each

        cjCount.crawledPageCount = pageNum
        yield cjCount.save()
      }// end of for loopp for page

      yield self.finish()// set self.constructor.name to true
    })
  }
}

module.exports = GetPostNumber
