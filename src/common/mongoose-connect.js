'use strict';
const config = require('src/common/get-config');
const mongodb = config.mongodb;
const mongoose = require('mongoose');


mongoose.connect(mongodb.uri, mongodb.options, function(err) {

  if(err) {
    console.error(err);
    process.exit(0);
  }
  console.log('connnected');
});

