'use strict'
require('app-module-path').addPath(__dirname)
require('src/boot')
// const cluster = require('cluster');
// const co = require('co');
// const errorDebug = require('debug')('error');
const coHandler = require('src/common/co-handler')
const config = require('src/common/get-config')
const crawlers = config.crawlers
const keys = Object.keys(crawlers)// instance's name

function startJob (job) {
  return coHandler(function * () {
    yield job.start()
  })
}
coHandler(function * () {
  for (let key of keys) {
    const crawler = crawlers[key] // instance of each job in config.test.js
    if (crawler.run === true) {
      const jobs = []
      const jobFiles = Object.keys(crawler.jobsConfig) // file name to run
      console.log(`jobFiles: ${require('util').inspect(jobFiles)}`)

      for (let jobFile of jobFiles) { // get each file
        const Job = require(jobFile) // which is a class of a job
        const job = new Job(crawler) // job with properties which got from config file in config.crawlers
        jobs.push(job)
      }

      let i
      for (let job of jobs) {
        i = 1
        console.log('into turn' + i)
        yield startJob(job)
        i++
      }
    }
  }
})
