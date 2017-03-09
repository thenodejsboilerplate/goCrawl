'use strict'
const request = require('request')
const debug = require('debug')('debug')
const debugBody = require('debug')('body')
const iconv = require('iconv-lite')
// const cookieHelper = require('./cookie-helper');
const coWrapper = require('./co-wrapper')

// /**
//  * @param  {String} url      [请求url]
//  * @param  {Object} headers [请求头]
//  * @param  {Object} urlParams [请求url参数]
//  * @param  {Object} queryParams [请求query参数]
//  * @return {Promise}
//  */
// const get = function(url, headers, quequerystring, loadFlag) {
//   return new Promise((resolve, reject) => {
//     url = pushRequestHelper.wrapUrl(url, urlParams);
//     request({
//       method: 'GET',
//       url: url,
//       headers,
//       qs: queryParams,
//       TIMEOUT
//     }, function(err, res, body) {
//       if(err)
//         reject(err);
//       else
//         resolve({res, body});
//     });
//   });
// };

// /**
//  * @param  {String} url      [要爬取的sfda地址]
//  * @param  {String} loadFlag [此url爬取到的标志]
//  * @return {}          [description]
//  */
// const get = function(url, queryString = {}, headers = {}, loadFlag = '', encoding = 'UTF-8', gzip = false) {
//   url = encodeURI(url);
//   console.log(url);

//   return coWrapper(function *() {

//     const ret = yield new Promise((resolve, reject) => {
//       request({
//         url: encodeURI(url),
//         headers: {
//           Cookie: cookieHelper.cookiesToString(cookies)
//         },
//       }, function(err, res, body) {
//         if(err)
//           reject(err);
//         else
//             resolve({res, body});
//       });
//     });

//     debug(ret.body.indexOf(loadFlag) !== -1);
//     debugBody(ret.body);
//     if(ret.body.indexOf(loadFlag) !== -1) {
//       return Promise.resolve({
//         load: 'success',
//         res: ret.res,
//         body: ret.body
//       });
//     }
//     else if(ret.body.indexOf('405') !== -1 || ret.body.indexOf('Method Not Allowed') !== -1) {
//       return Promise.resolve({
//         load: 'error'
//       });
//     }
//     else {
//       cookieHelper.addResCookieToCookies(ret.res, cookies);
//     }

//   });
// };

/**
 * @param  {String} url      [请求url]
 * @param  {Object} querystring [请求query参数]
 * @param  {Object} formData [请求body参数]
 * @param  {Object} heaers [请求头]
 * @param  {Object} loadFlag [页面抓取到的标志]
 * @param  {Object} encoding [Encoding to be used on setEncoding of response data]
 * @param  {Object} gzip [If true, add an Accept-Encoding header to request compressed content encodings from the server (if not already present) and decode supported content encodings in the response.]
 * @return {Promise}
 */
const requestMethod = function ({url, method = 'GET', queryString = {}, formData = {}, headers = {}, loadFlag = '', encoding = 'UTF-8', gzip = false}) {
  return coWrapper(function * () {
    let result = yield new Promise((resolve, reject) => {
      url = encodeURI(url)
      request({
        method: method,
        url,
        headers,
        qs: queryString, // object containing querystring values to be appended to the uri
        formData, // Data to pass for a multipart/form-data request. See Forms section above.
        gzip,
        encoding: null
      }, function (err, httpResponse, body) {
        if (err) { reject(err) } else {
          body = iconv.decode(body, encoding)
          debug('body is' + body)
          resolve({httpResponse, body})
        }
      })
    })

    debug(result.body.indexOf(loadFlag) !== -1)
    debugBody(result.body)

    if (result.body.indexOf(loadFlag) !== -1) {
      return Promise.resolve({
        load: 'success',
        res: result.httpResponse,
        body: result.body
      })
    } else {
      return Promise.resolve({
        load: 'error'
      })
    }
    // else if(result.body.indexOf('405') !== -1 || ret.body.indexOf('Method Not Allowed') !== -1) {
    //   return Promise.resolve({
    //     load: 'error'
    //   });
    // }
    // else {
    //   cookieHelper.addResCookieToCookies(result.httpResponse, cookies);
    // }
  })
}

module.exports = {
  requestMethod
}
