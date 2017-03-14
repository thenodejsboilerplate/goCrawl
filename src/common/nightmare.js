'use strict'
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: true,
  waitTimeout: 50000, // in ms
  openDevTools: true
})

module.exports = nightmare
