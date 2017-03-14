'use strict'

const PostNumber = require('src/models/instance/chinaJob/ChinaJobDetail')
const JobConst = require('src/consts/chinaJob')

const getOneUncrawledAndUpdateStatus = function (location) {
  return PostNumber.findOneAndUpdate({
    location,
    crawlStatus: JobConst.CRAWL_STATUS[0]
  }, {
    crawlStatus: JobConst.CRAWL_STATUS[1]
  }, {
    new: true
  })
  .exec()
}

module.exports = {
  getOneUncrawledAndUpdateStatus
}
