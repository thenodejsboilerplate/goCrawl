'use strict';
const mysql = require('src/common/get-config').mysql;
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: mysql.host,
    user: mysql.user,
    password: mysql.pass,
    database: mysql.dbname
  },
  useNullAsDefault: true
});

module.exports = knex;
