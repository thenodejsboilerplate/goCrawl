'use strict';
const env = process.env.NODE_ENV || 'test';
const config = require(`config.${env}.js`);

if (!config)
  throw new Error('配置文件`config.${env}.js`不存在!');

module.exports = config;
