'use strict'
const debug = require('debug')('debug')
const cheerio = require('cheerio')
const {format} = require('util')

const coHandler = require('src/common/co-handler')
const PostNumber = require('src/models/instance/chinaJob/ChinaJobPostNumber')
const Detail = require('src/models/JobDetail')
const CommonJob = require('src/jobs/instance/chinaJob/common/CommonJob')
const ERROR = require('src/consts/errors.js')
const JobConst = require('src/consts/chinaJob')
const validator = require('validator')

// const NumberService = require('src/services/chinaJob/NumberService')

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
            website: self.config.website
          })
          .exec()
          break
        case 'continue':
          yield PostNumber.update({
            website: self.config.website,
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
          console.log(self.config.website)
          // postNumber = yield NumberService.getOneUncrawledAndUpdateStatus(self.config.website)
          postNumber = yield PostNumber.findOne({
            website: self.config.website,
            crawlStatus: JobConst.CRAWL_STATUS[0] })
            .exec()

         // 找不到未爬取的连接，有两种可能性。1：目前已有的连接已经爬取完毕，但还会有后续的连接被插入等待爬取。2：所有连接爬取完毕，不会有后续的连接等待被插入。
          if (!postNumber) {
            console.log(`no postNuber existing...`)
            const done = yield self.dependencyDone()

            if (done) {
              yield self.finish()
              break
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

          let jobBody = $('#__01>tbody>tr:nth-child(2)>td').text()

          let jobName = $('td[bgcolor="#68b5df"]').text().trim()
          console.log('jobName ' + jobName)
          let postDateOriginal = jobBody.match(/Publish Date.*?([\d-]+?)School Province/)[1].trim()
          let postingDate = new Date(postDateOriginal).getTime()// .replace(/[&nbsp;:#xA0]/g, '')
          console.log('postingDate' + postingDate)
          let email = self.replaceColon(jobBody.match(/Email([^:].*?)Language Requirement/)[1].trim())
          // email = email.replace(/:/g, '')
          console.log('email' + email)

          let positionNumber = self.replaceColon(jobBody.match(/Request Number[\s\S](.*?)Provincial Foreign Affairs/)[1].trim())
          console.log('positionNumber' + positionNumber)

          // let companyName = self.replaceColon(jobBody.match(/Provincial Foreign Affairs[\s\S]?(.*?)[\s\S]?Salary/)[1].trim())
          // console.log('companyName' + companyName)
          // let province = self.replaceColon(jobBody.match(/School Province[\s\S](.*?)[\s\S]Request Number/)[1].trim())
          // console.log('province' + province)

          let salary = self.replaceColon(jobBody.match(/Salary(.*?)Certificate Number/)[1].trim())
          //salary = salary.replace(/^:/, '')
          console.log('salary' + salary)
          let city = self.replaceColon(jobBody.match(/School location(.*?)Distance to the nearest city/)[1].trim())
          //city = city.replace(/:/g, '')
          console.log('city' + city)

          let responsibility = self.replaceColon(jobBody.match(/Class Subject([\s\S]*?)Treatment Conditions/)[1].trim())
          console.log('responsibility' + responsibility)
          //responsibility = responsibility.replace(/:/g, '')
          let requirement = validator.escape(jobBody.match(/Particular request\(include nationality,language etc.\)([\s\S]*?)Special explain about overtime working/)[1].trim())
          requirement = city.replace(/[:\n]/, '')
          console.log('Requirement ' + requirement)
          let companyIntro = $('table:nth-child(2) table>tbody>tr>td:first-child>table>tbody>tr:nth-child(3)>td').text().trim()
          console.log('companyIntro :' + companyIntro)

          let welfare = self.replaceColon(jobBody.match(/Treatment Conditions([\s\S]*?)Particular request/)[1].trim())
          let livingCondition = self.replaceColon(validator.escape(jobBody.match(/Other living condition\(include inhabitancy\/telephone[\s\S]*?\/internet access\/television\/[\s\S]*?transportation\/etc\.\)([\s\S]*?)/)[1].trim()))
          welfare = welfare + livingCondition
          console.log('welfare ' + welfare)

          let searchQuery = jobBody
         // searchQuery = searchQuery.replace(/[:\n]/, '')

          // console.log(`jobBody IS ${jobBody}`)
          let existDetail = yield Detail.findOne({url}).exec()

          if (!existDetail) {
            debug(`href hasn't been crawled. crawling..`)

            let option = {
              website: 'chinajob.com',
              title: postNumber.title,
              url,
              jobName,
              city,
             // province,
             // companyName,
              companyIntro,
              // industry,
              requirement,
              salary,
              welfare,
              // phone,
              email,
              positionNumber,
              // content,
              searchQuery,
              responsibility,
              postingDate
             // expireDate
            }
            console.log('option' + option)

            let detail = new Detail(option)
            yield detail.save()

            postNumber.crawlStatus = JobConst.CRAWL_STATUS[2]
            yield postNumber.save()
          } else {
            debug(`href is already been crawled. skiping..`)
            continue
          }
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
