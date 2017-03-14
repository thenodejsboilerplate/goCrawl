'use strict';
const mongoose = require('mongoose');

const unCrawledFormDataSchema = new mongoose.Schema({
  location: {type: String, default: 'myInstance'},
  __go2pageNO: Number,
  leibie: {type: String, default: 'CORP_NAME'},
  key1: {type: String, default: ''},
  __go2pageNum: Number,
  whichPageIs: Number,
  done: {type: Boolean, default: false},
  doneRecord: {type: Boolean, default: false},
});
let UnCrawledFormData;
if (mongoose.models.FormData) {
  UnCrawledFormData =  mongoose.model('unCrawledFormData');
} else {
  UnCrawledFormData =  mongoose.model('unCrawledFormData', unCrawledFormDataSchema);
}

// FormData = mongoose.model('FormData', FormDataSchema);

module.exports = UnCrawledFormData;
