'use strict';
let co = require('co');
let logger = require('src/common/bunyanLogger');

module.exports = function (handle){
  return co(handle).catch(function(err){
    logger.error(err);
    return;
  });
};