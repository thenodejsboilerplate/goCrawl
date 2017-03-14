'use strict'
const mongoose = require('mongoose')

const CrawlerSchema = new mongoose.Schema({
  website: String,
  location: String,
  jobStatus: mongoose.Schema.Types.Mixed
})

let Crawler
if (mongoose.models.Crawler) {
  Crawler = mongoose.model('Crawler')
} else {
  Crawler = mongoose.model('Crawler', CrawlerSchema)
}

module.exports = Crawler
