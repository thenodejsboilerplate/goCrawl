'use strict';
const request = require('request');
const coHandler = require('src/common/co-handler');
const debug = require('debug')('debug');
const debugBody = require('debug')('body');
const iconv = require('iconv-lite');
const querystring = require('querystring');
const urls = require('url');

const cookieHelper = require('src/common/cookie-helper');

/**
 * @param  {String} url      [要爬取的sfda地址]
 * @param  {String} loadFlag [此url爬取到的标志]
 * @return {}          [description]
 */
const get = function(url, loadFlag) {
  debug(`url: ${url}`);

  let parsedUrl = urls.parse(url);
  //debug(`parsedUrl: ${JSON.stringify(parsedUrl)}`);
  let qs = querystring.parse(parsedUrl.query);
  let uri = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  //debug(parsedUrl,qs, uri);

  return coHandler(function *() {

    const ret = yield new Promise((resolve, reject) => {
      request.get({
        url: uri,
        qs: qs,
        headers: {
            //Cookie: cookieHelper.cookiesToString(cookies)
        //   'Accept-Encoding':'gzip, deflate, sdch',
        //   'Accept-Language':'en,zh-CN;q=0.8,zh;q=0.6',
        //   'Cache-Control':'max-age=0',
        //   'Connection':'keep-alive',
          'Cookie':'JSESSIONID=abcLJDZ0-EQfA6Gt9DkPv',
        },
        encoding: null,
        gzip: true,
        jar: true
      }, function(err, res, body) {
        //debug('body in get function is '+body, `url is ${url}`);
        //  / debug('buf in get method is'+body);
        if(err){
          reject(err);
        }else{
          
          if(!body){
            throw new Error('body不存在');
          }
          body = iconv.decode(body, 'gb2312');            
          resolve({res, body});

        }
          
      });
    });

    debug(ret.body.indexOf(loadFlag) !== -1);
    debugBody(ret.body);
    if(ret.body.indexOf(loadFlag) !== -1) {
      return Promise.resolve({
        load: 'success',
        res: ret.res,
        body: ret.body
      });
    }
    else if(ret.body.indexOf('405') !== -1 || ret.body.indexOf('Method Not Allowed') !== -1) {
      return Promise.resolve({
        load: 'error',
      });
    }
    else {
      //cookieHelper.addResCookieToCookies(ret.res, cookies);
      return Promise.resolve({
        load: 'error',
        res: '',
        body: ''
      });
    }

  });
};




/**
 * @param  {String} url      [要爬取的sfda地址]
 * @param  {String} loadFlag [此url爬取到的标志]
 * @return {Object} formContent [post content]
 */
const post = function(url, formContent, headers={}, loadFlag) {
  if(!url || !formContent){
    throw new Error('Url or formContent not exiting');
  }
  debug(url);
  return coHandler(function *() {
    
    const ret = yield new Promise((resolve, reject) => {
      debug('into post');
      request.post({
        url: encodeURI(url),
        gzip: true,
        headers,
        form: formContent,
        encoding: null
      }, function(err, httpResponse, body) {
        debug('into res');
        if(err){
          debug(err);
          reject(err);
        }else if(httpResponse.statusCode !== 200){
          debug(httpResponse.statusCode+ 'is not 200 statusCode');
          reject();
        }
        else{
          body = iconv.decode(body, 'gb2312');
          debug(`body in post method is ${body}`);
          resolve({httpResponse, body});
        }
            
      });
    });

    debug(ret.body.indexOf(loadFlag) !== -1);
    debugBody(ret.body);
    
    if(ret.body.indexOf(loadFlag) !== -1) {
      return Promise.resolve({
        load: 'success',
        response: ret.httpResponse,
        body: ret.body,
      });
    }
    else{
      return Promise.resolve({
        load: 'fail',
        response: ret.httpResponse
      });
    }

  });
};

module.exports = {
  get,
  post
};
