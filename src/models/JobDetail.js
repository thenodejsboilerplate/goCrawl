'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')
var jobSchema = new Schema({
  // location: String, // it's for the system not for the job content
  website: {type: String},

  url: String,
  account: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  country: {type: String},
  province: {type: String},
  city: {type: String},
  subject: String, // for instance: teacher job, internet jobs..
  jobName: String,
  category: String,

 // content: {type: String},
  title: {type: String, required: true},
  searchQuery: {type: String, required: true}, // for search purpose only
  postingDate: {type: Number, required: true}, // millionseconds
  expireDate: {type: Number},

  companyName: {type: String},
  industry: String,
  companyIntro: String,
  positionNumber: {type: String}, // how many teacher needed
  salary: {type: String, default: 'Negotiable'},
  welfare: {type: String},

  requirement: String, // requirement
  responsibility: {type: String},
  phone: {type: String},
  email: {type: String},
  // email: {
  //   type: String,
  //   validate: [
  //     function (email) {
  //       return email.includes('@')
  //     }, 'invalid email'
  //   ]
  // },

  officialSite: String
}, {timestamps: true})

// jobSchema.methods.time = time => {
//   return moment(time).format('L')
// }
// methods ======================

jobSchema.methods.time = time => {
  return moment(time).format('L')
}

jobSchema.methods.processJob = job => {
  return {
    _id: job._id,
    website: job.website,

    url: job.url,
    account: job.account,
    country: job.country,
    province: job.province,
    city: job.city,
    subject: job.subject, // for instance: teacher job, internet jobs..
    jobName: job.jobName,
    category: job.category,
   // content: job.content,
    title: job.title,
    searchQuery: job.searchQuery, // for search purpose only
    postingDate: moment(job.postingDate).format('L'), // millionseconds
    expireDate: moment(job.expireDate).format('L'),
    companyName: job.companyName,
    industry: job.industry,
    companyIntro: job.companyIntro,
    positionNumber: job.positionNumber, // how many teacher needed
    salary: job.salary,
    welfare: job.welfare,
    requirement: job.requirement, // requirement
    responsibility: job.requirement,
    phone: job.phone,
    email: job.email,
    officialSite: job.officialSite,
    created_at: moment(job.created_at).format('L'),
    updated_at: moment(job.updated_at).format('L')
  }
}

let JobDetail
try {
  JobDetail = mongoose.model('JobDetail')
} catch (error) {
  JobDetail = mongoose.model('JobDetail', jobSchema)
}

// make this available to our users in our Node applications
module.exports = JobDetail
