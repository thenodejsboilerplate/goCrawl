'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment');
const CONST = require('src/consts/jobsitechina')

var linkSchema = new Schema({
  website: String,
  title: String,
  date: String,
  link: String,
  crawlStatus: {
    type: String,
    default: CONST.CRAWL_STATUS[0]
  }
}, {timestamps: true})

linkSchema.methods.time = time => {
  return moment(time).format('L')
}


let Link
try {
  Link = mongoose.model('jobSiteChinaLink')
} catch (error) {
  Link = mongoose.model('jobSiteChinaLink', linkSchema)
}

// make this available to our users in our Node applications
module.exports = Link
