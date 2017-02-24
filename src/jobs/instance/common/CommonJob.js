'use strict';
const path = require('path');
const co = require('co');
const {post, get} = require('src/common/instance-request');
const coHandler = require('src/common/co-handler');
const debug = require('debug')('debug');
const config = require('src/common/get-config');

const CorpDetailHref = require('src/models/instance/Href');
let cookies = {
  JSESSIONID: 'abcLJDZ0-EQfA6Gt9DkPv'
};

class CommonJob {

  constructor(config) {
    this.config = config;
  }

  getBody(url,formContent, loadFlag) {
    const self = this;
    return coHandler(function *() {
      debug('into getBody');
      const ret = yield post(url, formContent, cookies, loadFlag);

      if(ret.load === 'success') {
        return Promise.resolve(ret.body);
      }
      else if(ret.load === 'error') {
        throw new Error('URL_REQUEST_ERROR');
      }
      else {
        throw new Error('CAN_NOT_REQUEST');
      }
    });
  }


  getDetailPage(url, loadFlag) {

    return coHandler(function *() {
      const ret = yield get(url, loadFlag);

    // if(ret.body && ret.body.indexOf('维护中') !== -1){
    //   throw new Error('系统正在维护中。。');
    // }
    // console.log('into getBody'+ ret);
    // console.log('ret.res.body'+ret.res.body);
      if(ret.load === 'success') {
        return Promise.resolve(ret.body);
      }
      else if(ret.load === 'error') {
        throw new Error('URL_REQUEST_ERROR');
      }
      else {
        throw new Error('CAN_NOT_REQUEST');
      }
    });
  }


  getCount(url, loadFlag){
    const self = this;
    return coHandler(function *(){
      let res = {};

      let formContent = {
        __go2pageNO: self.config.__go2pageNO_Init,
        leibie: 'CORP_NAME',
        key1: '',
        __go2pageNum: self.config.__go2pageNum_Init
      };

      let body = yield self.getBody(url, formContent, loadFlag);

      res.corpCount = parseInt(body.match(/共(\d+)条/)[1]);
      res.pageCount = parseInt(body.match(/第\d\/(\d+)页/)[1]);
   

      debug(`productCount: ${res.corpCount}, pageCount: ${res.pageCount}`);
      return Promise.resolve(res);
    });
  }


  whichPage(option,url,loadFlag){
    const self = this;
    return coHandler(function *(){
      let body = yield self.getBody(url, option, loadFlag);
      let whichPage = parseInt(body.match(/第(\d+)\/\d+页/)[1]);
      return Promise.resolve(whichPage);
    });
  }


  storeHref(body){
    return co(function*(){

      debug('inot storeHref');
      let hrefs = body.match(/transid=([A-Z0-9]*)/g);
      if(!hrefs){
        debug('no hrefs left...' );
        return Promise.resolve();
      }
      debug('hrefs is '+ hrefs);

      for(let i=0;i<hrefs.length-1;i++){
        debug(`${i}: hrefs: ${hrefs}`);
        debug(`${i} href is being kept in the db..`);
        let href = 'jy_xzspinfo.jsp?' + hrefs[i];
        
        let hrefExist = yield CorpDetailHref.findOne({href: href, doneRecord: true}).exec();
        debug(`hrefExist: ${hrefExist}`);
        if(hrefExist){
          debug(`you\'ve already kept the href: ${hrefs[i]}. so we'll skip it`);
          continue;
        }

        let corpDetailHref = new CorpDetailHref();
        corpDetailHref.href = href;
        corpDetailHref.doneRecord = true;
        yield corpDetailHref.save();
        debug(`${i} href is done kept in the db..`);
        debug(`res.href: ${href}`);

      }

      return Promise.resolve();
    });

  }


  //next prototype methods

}

module.exports = CommonJob;