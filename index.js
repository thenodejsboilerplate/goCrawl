'use strict'
require('app-module-path').addPath(__dirname)
require('src/boot')
const cluster = require('cluster')
const coHandler = require('src/common/co-handler')
const config = require('src/common/get-config')
const crawlers = config.crawlers
const keys = Object.keys(crawlers)// instance's name
const JSON5 = require('json5')

function startJob (job) {
  return coHandler(function * () {
    yield job.start()
  })
}

const workers = {}

setInterval(function () {
  console.log(workers)
}, 10000)

if (cluster.isMaster) {
  cluster.on('exit', (worker) => {
    const newWorker = cluster.fork(workers[worker.id])// env: key-value pairs
    if (workers[newWorker.id !== worker.id]) {
      delete workers[worker.id]
    }
  })

  coHandler(function * () {
    for (let key of keys) {
      const crawler = crawlers[key] // instance of each job in config.test.js
      console.log(`crawler run: ${crawler.run}`)
      if (crawler.run === true) {
        const jobs = []
        const jobFiles = Object.keys(crawler.jobsConfig) // file name to run
        console.log(`jobFiles: ${require('util').inspect(jobFiles)}`)

        for (let jobFile of jobFiles) { // get each file
          const Job = require(jobFile) // which is a class of a job
          const job = new Job(crawler) // job with properties which got from config file in config.crawlers

          yield job.init()
          if (crawler.jobsConfig[jobFile].thread === 'master') {
            jobs.push(job)
          } else if (crawler.jobsConfig[jobFile].thread === 'worker') {
            for (let i = 0; i < crawler.jobsConfig[jobFile].count; i++) {
              const env = {
                jobFile,
                config: JSON5.stringify(crawler)
              }
              const worker = cluster.fork(env)// put env as an env variable and can be reached in the work process
              workers[worker.id] = env// for use in the exist handler
            }
          }
        }

        for (let job of jobs) {
          yield startJob(job)// master worker runs first
        }
      }
    }
  })
} else {
  // * cluster.isWorker */
  coHandler(function * () {

   if(!process.env.config) {
     return
   }
   let config = JSON5.parse(process.env.config)
    
    const jobFile = process.env.jobFile
    const Job = require(jobFile)
    const job = new Job(config)

    yield startJob(job) // worker runs according to the config in the env variables
  })
}
