'use strict';
const	{basename, extname} = require('path');
const	{readdir} = require('src/common/filesystem');

module.exports = function (app){
  app.head('/version', function(req, res, next) {
    res.header('Version', '1.0');
    res.json(200);
    next();
  });

  readdir('src/routes')
  .filter(file => extname(file) === '.js' && basename(file) !== 'index.js')
  .forEach(file => require(file)(app));
};
