'use strict';
const mongoose = require('mongoose');

const SfdaConst = require('src/const/sfda');

const CrawlerSchema = new mongoose.Schema({
  website: String,
  location: String,
  jobStatus: {}
});

const Crawler = mongoose.model('Crawler', CrawlerSchema);

module.exports = Crawler;
