'use strict';
// const path = require('path');
const config = require('src/common/get-config');


const debug = require('debug')('debug');
const {format} = require('util');

const cheerio = require('cheerio');
const coHandler = require('src/common/co-handler');
// const loadFlag = 'wen1';
const FormData = require('src/models/instance/FormData'); 
const Href = require('src/models/instance/Href');
const CorpDetail = require('src/models/instance/CorpDetail');

const CommonJob =  require('src/jobs/instance/common/CommonJob');
const ERROR = require('src/consts/errors.js');

class GetCorpDetail extends CommonJob {
  init() {
    const self = this;

    return coHandler(function *() {
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

  start() {
    const self = this;
    debug('finish keeping form data..');
    return coHandler(function*(){
      let formDatas = FormData.find({doneRecord: true,done: false}).cursor();
        
      for(let doc = yield formDatas.next(); doc != null; doc = yield formDatas.next()){
          
        let formContent = {
          __go2pageNO: doc.__go2pageNO,
          leibie: doc.leibie,
          key1: doc.key1,
          __go2pageNum: doc.__go2pageNum
        };
        const initUrl = self.config.initUrl;
        const loadFlag = self.config.loadFlag;
        let whichPageIs = yield self.whichPage(formContent,initUrl,loadFlag);

        let body = yield self.getBody(initUrl, formContent,{}, loadFlag);
          //debug(`body in every page: ${body}`);

          //storing href got from each page..
        yield self.storeHref(body);
        doc.done = true;
        yield doc.save();
        debug(`Finish dealing with one page: ${whichPageIs}`);
          
      }

        //get the detailed page
      let hrefs = Href.find({doneRecord: true,done: false}).cursor();
        
      for(let doc = yield hrefs.next(); doc != null; doc = yield hrefs.next()){
        debug('start to storing the detail of corps...'+ doc.href);

        let loadFlag = 'style11';
        let href =`${config.detailPageBase}/${doc.href}`;
        let body = yield self.getDetailPage(href,  loadFlag);

        let $ = cheerio.load(body);

        let registerAddr,
          repAddr,
          representive,
          corpManager,
          qualityManager,
          permitNo,
          businessScope,
          permittingDate,
          expire,
          location;
          
        let corpName = $('table tr.style11>td>div').text().trim();
        let corNameValue = $('table tr.style11>td[width="78%"]').text().trim();

        let exist = yield CorpDetail.find({done: true, corpName:corNameValue}).exec();
        if(exist[0]){
          debug(`The ${corNameValue} has already been kept in the db. Skip it...`);
          continue;
        }

        let datas = $('table tr.style11');
        datas.each(function(i, data){
          let name = $(this).find('td[align]').text().trim();
          let value = $(this).find('td[bgcolor="#FFFFFF"]').text().trim();
          debug(`name ${name}, value ${value}`);

          if(name==='注册地址'){
            registerAddr = value;
          }else if(name === '仓库地址'){
            repAddr = value;
          }else if(name === '法定代表人'){
            representive = value;
          }
          else if(name === '企业负责人'){
            corpManager = value;
          }
          else if(name === '质量负责人'){
            qualityManager = value;
          }
          else if(name === '许可证编号'){
            permitNo = value;
          }
          else if(name === '经营范围'){
            businessScope = value;
          }
          else if(name === '发证日期'){
            permittingDate = value;
          }
          else if(name === '有效期至'){
            expire = value;
          }
          else if(name === '所属地区'){
            location = value;
          }
        });
          
        debug(`dealing with: ${corNameValue}'s data`);
          
        let option = {
          corpName:corNameValue,
          registerAddr:registerAddr,
          repAddr: repAddr,
          representive: representive,
          corpManager: corpManager,
          qualityManager:qualityManager,
          permitNo: permitNo,
          businessScope: businessScope,
          permittingDate: permittingDate,
          expire: expire,
          location: location,
          done: true
        };



        let corpDetail = new CorpDetail(option);
        yield corpDetail.save();
        doc.done = true;
        yield doc.save();
        debug(`successfully keeping ${corNameValue}'s data  into the db...`);
      }

      yield self.tryAgainIfFail(CorpDetail,6135 ,self);    
    });

    

  }

  // tryAgainIfFail () {
  //   const self = this;
  //   coHandler(function*(){
  //     let done = this.doneStatus(CorpDetail, config.crawlNnumber);
  //     let counter = 0;
  //     if(!done){
  //       if(counter>5){
  //         return;
  //       }
  //       yield self.start();
  //       counter++;
  //       self.tryAgainIfFail();
  //     }
  //     return;
      
  //   });

  // }




}

module.exports = GetCorpDetail;