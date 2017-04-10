'use strict'
const debug = require('debug')('debug')
const cheerio = require('cheerio')
const {format} = require('util')

const JobConst = require('src/consts/chinaJob')
const nightmare = require('src/common/nightmare')
const coHandler = require('src/common/co-handler')
const Href = require('src/models/jobsitechina/Link')
// const Detail = require('src/models/jobsitechina/Detail')
const CommonJob = require('src/jobs/jobsitechina/common/CommonJob')
const ERROR = require('src/consts/errors.js')

class Link extends CommonJob {
  constructor (config) {
    super(config)
    this.config = config
  }

  init () {
    const self = this

    return coHandler(function * () {
      switch (self.config.strategy) {
        case 'restart':
          yield Href.remove({
            website: self.config.website
          })
          .exec()
          break
        case 'continue':
          yield Href.update({
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
    let self = this
    return coHandler(function * () {
      function storeHref (html) {
        const $ = cheerio.load(html)
        // for debugging
        let currentPage = $('#LblCurrentPage').text()
        console.log(`currentPage is: ${currentPage}`)

        let links = $('#form1 table:nth-child(2)>tbody>tr').not('.cn_txtlan1')
        // debug(`links: ${links}`)
       // console.log(`links: ${links}`)
        links.each(function (i, v) {
          let that = $(this)
          coHandler(function * () {
            let title = that.find('td[align="left"]').text()
            let href = that.find('td>a').attr('href')
            let date = that.find('td:nth-child(5)').text()

            href = 'http://www.jobsitechina.com/' + href

            let hrefEist = yield Href.findOne({
              website: self.config.website,
              link: href,
              title,
              date
            })
            if (!hrefEist) {
              let option = {
                website: self.config.website,
                title,
                link: href,
                date
              }
              let link = new Href(option)
              yield link.save()
              console.log('next iteration..')
            } else {
              debug(`href exist: ${href}`)
              return true
            }
          })// end of coHandler
        })
        
      }// storeHref

      let html = yield self.getHTML(self.config.initUrl, 'postList')
      storeHref(html)
      yield self.finish()

      // yield nightmare
      //     .goto(self.config.initUrl)
      //     .exists('#LinkBtnNext')
      //     .click('#LinkBtnNext')
      //     .wait('#form1')
      //     .evaluate(function () {
      //       return document.getElementsByTagName('body')[0].innerHTML
      //     })
      //     .then(function (html) {
      //       storeHref(html)
      //     })

      
      return Promise.resolve()
    })
  }
}

module.exports = Link
