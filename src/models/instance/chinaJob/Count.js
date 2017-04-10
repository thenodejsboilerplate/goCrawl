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
if (mongoose.models.ChinaJob_Count) {
  JobCount = mongoose.model('ChinaJob_Count')
} else {
  JobCount = mongoose.model('ChinaJob_Count', JobCountSchema)
}

module.exports = JobCount
