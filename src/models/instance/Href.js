'use strict';
const mongoose = require('mongoose');

const HrefSchema = new mongoose.Schema({
  href: {type: String, default: ''},
  done: {type: Boolean, default: false},
  doneRecord: {type: Boolean, default: false}
});
let Href;
if (mongoose.models.CorpDetail) {
  Href =  mongoose.model('Href');
} else {
  Href =  mongoose.model('Href', HrefSchema);
}
//const Href = mongoose.model('Href', HrefSchema);;
module.exports = Href;
