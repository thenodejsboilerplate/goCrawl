'use strict';
const path = require('path');
const co = require('co');
const {post, get} = require('src/common/instance-request');
const coHandler = require('src/common/co-handler');
const debug = require('debug')('debug');
const logger = require('src/common/bunyanLogger');
const config = require('src/common/get-config');
const cheerio = require('cheerio');

const CorpDetailHref = require('src/models/instance/Href');

class CommonJob {

  constructor(config) {
    this.config = config;
  }

  doneStatus(Model, crawlNumber){
    const self = this;
    return coHandler(function* (){
      let exactCount = yield Model.find().count().exec();
      let counter = 0;
      if(crawlNumber !== exactCount) {
        debug('the exact number crawled is not the same as it should be! we are restarting to crawl..');
        return false;
      }
      debug('Complete Crawling!');
      return true;

    });
  }

  tryAgainIfFail (Model, crawlNumber,that) {
    const self = this;
    return coHandler(function*(){
      let done = yield self.doneStatus(Model, crawlNumber);
      let counter = 0;
      if(!done){
        if(counter>5){
          return;
        }
        console.log('we have pages left.so we restart crawling..');
        yield that.start();
        counter++;
        return self.tryAgainIfFail(Model, crawlNumber,that);
      }
      return Promise.resolve();
      
    });

  }

  /**
   * to check if the page you are crawling contains the data you want and is accesible
   * @return Promise
   * 
   */
  isAlive (url, formContent,headers, loadFlag) {
    const self = this;
    return coHandler(function* (){
      let body;
      try{
        body = yield self.getBody(url,formContent,headers, loadFlag);
        if(body.includes('NDATA_')){
          return Promise.resolve(false);
        }
      }catch(err){
        return Promise.resolve(false);
      }
      
      let alive = body.includes(loadFlag);
      if(alive){
        return Promise.resolve(true);
      }else{
        Promise.resolve(false);
      }
      
    });


  }


  getBody(url,formContent, headers, loadFlag) {
    const self = this;
    return coHandler(function *() {
      debug('into getBody');
      const ret = yield post(url, formContent, headers, loadFlag);

      if(ret.load === 'success') {
        return Promise.resolve(ret.body);
      }
      else if(ret.load === 'error') {
        let code = ret.response.statusCode; 
        if(code === 200){
          logger.error(`NDATA_NO_REQUIRED_DATA: when getting ${url} page content!`);
          return Promise.resolve('NDATA_NO_REQUIRED_DATA!');
        }else if(code === 401) {
          logger.error(`NDATA_UNAUTHORIZED: when getting ${url} page content!`);
          return Promise.resolve('NDATA_UNAUTHORIZED!');
        }else if(code === 404){
          logger.error(`NDATA_NOT_FOUND: when getting ${url} page content!`);
          return Promise.resolve('NDATA_NOT_FOUND!');
        }else{
          logger.error(`NDATA_REQUEST_FAIL: when getting ${url} page content!`);
          return Promise.resolve('NDATA_REQUEST_FAIL!');
        }
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


  getCount(url, headers={}, loadFlag){
    const self = this;
    return coHandler(function *(){
      let res = {};

      let formContent = {
        __go2pageNO: self.config.__go2pageNO_Init,
        leibie: 'CORP_NAME',
        key1: '',
        __go2pageNum: self.config.__go2pageNum_Init
      };

      let body = yield self.getBody(url, formContent, headers, loadFlag);

      res.corpCount = parseInt(body.match(/共(\d+)条/)[1]);
      res.pageCount = parseInt(body.match(/第\d\/(\d+)页/)[1]);
   

      debug(`productCount: ${res.corpCount}, pageCount: ${res.pageCount}`);
      return Promise.resolve(res);
    });
  }

  // getLeftRecords(Model, loadFlag) {
  //   const self = this;
  //   return coHandler(function *(){
  //     let failedRecords = yield Model.find({doneRecord: false}).exec();
  //     let crawledCount = yield Model.find({doneRecord: true}).count().exec();
  //     if(failedRecords){
  //       return Promise.resolve(crawledCount);
  //     }

  //     let getCountRes = yield self.getCount(self.config.initUrl, {}, loadFlag);
  //     debug('below getCountRes');
  //     let lengths = getCountRes.pageCount;
  //     debug(`page account is ${lengths}`);
     
  //     return Promise.resolve(lengths);

  //   });
    
  // }


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