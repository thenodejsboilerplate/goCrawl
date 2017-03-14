'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')
var jobSchema = new Schema({
  location: String,
  from: {type: String, default: 'chinajob.com'},
  subject: String,
  title: {type: String, required: true},
  content: {type: String, required: true},
  date: String
}, {timestamps: true})

jobSchema.methods.time = time => {
  return moment(time).format('L')
}

let ChinaJobDetail
try {
  ChinaJobDetail = mongoose.model('ChinaJobDetail')
} catch (error) {
  ChinaJobDetail = mongoose.model('ChinaJobDetail', jobSchema)
}
// make this available to our users in our Node applications
module.exports = ChinaJobDetail
