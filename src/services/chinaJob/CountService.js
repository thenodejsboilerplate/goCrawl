'use strict'
const co = require('co')

const JobCount = require('src/models/instance/chinajob/Count')

const exists = function (conditon) {
  return co(function * () {
    const jobCount = yield JobCount.findOne(conditon).exec()
    return jobCount !== null
  })
}

const findOne = function (condition) {
  return JobCount.findOne(condition).exec()
}

module.exports = {
  exists,
  findOne
}
