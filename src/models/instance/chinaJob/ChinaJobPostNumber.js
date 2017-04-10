'use strict'
const mongoose = require('mongoose')
const CONST = require('src/consts/chinaJob')

const NumSchema = new mongoose.Schema({
  website: String,
  number: {type: String, default: ''},
  title: {type: String, default: ''},
  crawlStatus: {
    type: String,
    default: CONST.CRAWL_STATUS[0]
  }
  // doneRecord: {type: Boolean, default: false}
})
let ChinaJobNum
if (mongoose.models.ChinaJob_Num) {
  ChinaJobNum = mongoose.model('ChinaJob_Num')
} else {
  ChinaJobNum = mongoose.model('ChinaJob_Num', NumSchema)
}

module.exports = ChinaJobNum
