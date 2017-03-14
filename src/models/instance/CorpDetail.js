'use strict'
const mongoose = require('mongoose')

const CorpDetailSchema = new mongoose.Schema({
//  / crawlerLocation: {type: String, default: 'qxjy'},
  corpName: {type: String, default: ''},
  registerAddr: {type: String, default: ''},
  repAddr: {type: String, default: ''},
  representive: {type: String, default: ''},
  corpManager: {type: String, default: ''},
  qualityManager: {type: String, default: ''},
  permitNo: {type: String, default: ''},
  businessScope: {type: String, default: ''},
  permittingDate: {type: String, default: ''},
  expire: {type: String, default: ''},
  location: {type: String, default: ''},
  done: {type: Boolean, default: false}
})

let CorpDetail
if (mongoose.models.CorpDetail) {
  CorpDetail = mongoose.model('CorpDetail')
} else {
  CorpDetail = mongoose.model('CorpDetail', CorpDetailSchema)
}
// const CorpDetail = mongoose.model('CorpDetail', CorpDetailSchema);

module.exports = CorpDetail
