'use strict'
const mongoose = require('mongoose')

const JobCountSchema = new mongoose.Schema({
  location: String,
  postCount: {
    type: Number,
    default: 0
  },
  crawledPageCount: {
    type: Number,
    default: 0
  },
  totalPageCount: {
    type: Number,
    default: 1
  }
})
let JobCount
if (mongoose.models.JobCount) {
  JobCount = mongoose.model('JobCount')
} else {
  JobCount = mongoose.model('JobCount', JobCountSchema)
}

module.exports = JobCount
