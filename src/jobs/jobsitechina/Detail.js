'use strict'
const debug = require('debug')('debug')
const cheerio = require('cheerio')
const {format} = require('util')

const JobConst = require('src/consts/jobsitechina')
const coHandler = require('src/common/co-handler')
const Link = require('src/models/jobsitechina/Link')
const LinkDetail = require('src/models/JobDetail')
const CommonJob = require('src/jobs/jobsitechina/common/CommonJob')
const ERROR = require('src/consts/errors.js')

class Detail extends CommonJob {
  constructor (config) {
    super(config)
    this.config = config
  }

  init () {
    const self = this

    return coHandler(function * () {
      switch (self.config.strategy) {
        case 'restart':
          yield LinkDetail.remove({
            website: self.config.website
          })
          .exec()
          break
        case 'continue':
          yield Link.update({
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
      let linkJob

      try {
        while (true) {
          // debug(self.config.website)

          linkJob = yield Link.findOne({
            website: self.config.website,
            crawlStatus: JobConst.CRAWL_STATUS[0]
          }).exec()
          // console.log('into start'+ 'linkjob:'+ linkJob)
         // debug(`website: ${self.config.website}, crawlStatus: ${JobConst.CRAWL_STATUS[0]} in jobsitechina to find if there is link left to crawl. linkJob: ${linkJob}`)

          // 找不到未爬取的连接，有两种可能性。1：目前已有的连接已经爬取完毕，但还会有后续的连接被插入等待爬取。2：所有连接爬取完毕，不会有后续的连接等待被插入。
          if (!linkJob) {
            debug('no link existing in the db..')
            const done = yield self.dependencyDone()

            if (done) {
              yield self.finish()
              debug(`Finish crawling one job: ${self.config.website}, we'll wait for another...`)
              break
            } else {
              continue
            }
          }

          linkJob.crawlStatus = JobConst.CRAWL_STATUS[1]
          yield linkJob.save()

          let url = linkJob.link

          debug(`linkJob: ${url}`)
 
          const html = yield self.getHTML(url, 'postDetail')
          // console.log(`html in detail: ${html}`)
          let $ = cheerio.load(html)

          // let lblId = $('#LblID').text().trim()
          // console.log(lblId)
          let existContent = yield LinkDetail.findOne({url}).exec()

          if (!existContent) {
            console.log('under data built')
            let companyName = $('#LblCompany').text().trim()
            let jobName = $('#LblJobName').text().trim()
            let industry = $('#LblIndustry').text().trim()
            let positionNumber = $('#LblPositionNumber').text().trim()
            let city = $('#LblWorkCity').text().trim()
            let salary = $('#LblMonthlySalary').text().trim()
            let phone = $('#LblPhone').text().trim()
           // let email = $('#LblEmail').text().trim()

            let responsibility = $('#LblDescription').text().trim()
            let requirement = $('#LblQualification').text().trim()

            let welfare = $('#LblWelfare').text().trim()
            let companyIntro = $('#LblIntroduce').text().trim()

           // let expireDate = $('#LblPeriod').text().trim()
            function dateToSec (date) {
              return new Date(date).getTime()
            }
            var reg = $('#LblPeriod').text().match(/至 (\d+)-(\d+)-(\d+)/)
            let expireDate
            if (reg[2].length === 1) {
              expireDate = dateToSec(reg[1] + '-0' + reg[2] + '-' + reg[3])
            } else {
              expireDate = dateToSec(reg[1] + '-' + reg[2] + '-' + reg[3])
            }


            // let content = `Responsibility: \n   ${responsibility} \n Requirement: \n   ${requirement} \n Welfare: \n   ${welfare} \n Company Introduction: \n   ${companyIntro}`
            let searchQuery = (linkJob.title + jobName + city + companyName + industry + requirement + responsibility).toLowerCase()

            let option = {
              website: 'jobsitechina.com',
              title: linkJob.title,
              url,
              jobName,
              city,
              companyName,
              companyIntro,
              industry,
              requirement,
              salary,
              welfare,
              phone,
              // email,
              positionNumber,
              // content,
              searchQuery,
              responsibility,
              postingDate: dateToSec(linkJob.date),
              expireDate
            }
            console.log(require('util').inspect(option))
            let linkdetail = new LinkDetail(option)
            
            yield linkdetail.save()
            console.log('below save')

            linkJob.crawlStatus = JobConst.CRAWL_STATUS[2]
            yield linkJob.save()
            debug('craweling the next url..')
            continue
          } else {
            debug(`href is already been crawled. skiping..`)
            continue
          }
        } // end of while
        return Promise.resolve()
      } catch (e) {
        linkJob.crawlStatus = JobConst.CRAWL_STATUS[0]
        yield linkJob.save()
        throw e
      }
    }) // end of coHandler
  } // end of start

  dependency () {
    return 'Link'
    // get true or not from the Crawl db, which is the job class file name under jobs/..
  }
}

module.exports = Detail
