'use strict'
const express = require('express')
const co = require('co')
const debug = require('debug')('debug')
const wrapResult = require('src/common/wrapResult')

/**
 * 根据注册证编号，返回数据
 * @RegistrationCertificateNo 注册证编号
 */
const getProduct = co_restify_handle(function * (req, res, next) {

})

module.exports = function (app) {
  app.get('', getProduct)
}
