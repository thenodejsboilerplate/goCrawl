'use strict';
const mongoose = require('mongoose');

const FormDataSchema = new mongoose.Schema({
  location: {type: String, default: 'myInstance'},
  __go2pageNO: Number,
  leibie: {type: String, default: 'CORP_NAME'},
  key1: {type: String, default: ''},
  __go2pageNum: Number,
  whichPageIs: Number,
  done: {type: Boolean, default: false},
  doneRecord: {type: Boolean, default: false},
});
let FormData;
if (mongoose.models.FormData) {
  FormData =  mongoose.model('FromData');
} else {
  FormData =  mongoose.model('FromData', FormDataSchema);
}

// FormData = mongoose.model('FormData', FormDataSchema);

module.exports = FormData;
