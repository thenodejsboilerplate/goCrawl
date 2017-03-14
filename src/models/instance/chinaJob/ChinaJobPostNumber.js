'use strict'
const mongoose = require('mongoose')
const CONST = require('src/consts/chinaJob')

const NumSchema = new mongoose.Schema({
  location: String,
  number: {type: String, default: ''},
  title: {type: String, default: ''},
  crawlStatus: {
    type: String,
    default: CONST.CRAWL_STATUS[0]
  }
  // doneRecord: {type: Boolean, default: false}
})
let ChinaJobNum
if (mongoose.models.ChinaJobHref) {
  ChinaJobNum = mongoose.model('ChinaJobNum')
} else {
  ChinaJobNum = mongoose.model('ChinaJobNum', NumSchema)
}

module.exports = ChinaJobNum
