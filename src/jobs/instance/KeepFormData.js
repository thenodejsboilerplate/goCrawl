'use strict';
const co = require('co');
const debug = require('debug')('keepFromData');
const {format} = require('util');
const coHandler = require('src/common/co-handler');
const FormData = require('src/models/instance/FormData'); 
const CommonJob =  require('src/jobs/instance/common/CommonJob');
const ERROR = require('src/consts/errors.js');

class KeepFormData extends CommonJob {
  constructor(config) {
    super(config);
  }

  init() {
    const self = this;

    return co(function *() {
      switch(self.config.strategy) {
        case 'restart':
          yield FormData.remove({
            identifier: self.config.identifier
          })
          .exec();
          break;
        case 'continue':
          // yield SfdaProductDetailLink.update({
          //   location: self.config.location,
          //   crawlStatus: SfdaConst.CRAWL_STATUS[1]
          // },
          //   {
          //     $set:{
          //       crawlStatus: SfdaConst.CRAWL_STATUS[0]
          //     }
          //   }, {
          //     multi: true
          //   })
          // .exec();
          break;
        default:
          throw new Error(format(ERROR.INVALID_STRATEGY, self.config.strategy));
      }
    });
  }



  start(){
    const self = this;
    const loadFlag = this.config.aliveLoadFlag;

    return coHandler(function*(){
      let getCountRes = yield self.getCount(self.config.initUrl,loadFlag);
      debug('below getCountRes');
      let lengths = getCountRes.pageCount;
      debug(`page account is ${lengths}`);

      for(let i=0;i<=lengths-1;i++){
        debug('keeping all the form data needed to get each page in the db ');
        let exist = yield FormData.findOne({doneRecord: true,__go2pageNO: i+1}).exec();
        debug(`exist: ${exist}`);
        debug(`page account is ${lengths}`);
        if(exist){
          debug('exits, skip it..');
          continue;
        }else{
          let formContent = {};
          formContent.__go2pageNO = i + 1;
          formContent.__go2pageNum = i;
          let whichPageIs = yield self.whichPage(formContent,self.config.initUrl,self.config.loadFlag);
          if(whichPageIs === 24){
            continue;
          }
          let formData = new FormData(formContent);
          
          formData.doneRecord = true;
          formData.whichPageIs = whichPageIs;
          yield formData.save();
          debug('successfully keeping one data to the db. Next..');
        }
      }
      return Promise.resolve();
      

    });
  }

}

module.exports =  KeepFormData;