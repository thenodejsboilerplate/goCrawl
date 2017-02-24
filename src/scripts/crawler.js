'use strict';
const initUrl = 'http://www.zjfda.gov.cn/sjcx/qxjy_xzspsearch.jsp';
const co = require('co');
const debug = require('debug')('debug');
const path = require('path');
require('app-module-path').addPath(path.resolve(__dirname, '../../'));
const {getBody,getCount,getHrefAndStore} = require('src/jobs/getBody');
const loadFlag = 'wen1';
const MLink = require('src/models/qxjy/mLink');
const Href = require('src/models/qxjy/corpDetailHref');
require('src/common/mongoose-connect');

co(function*(){

  //let body = yield getBody(initUrl, formContent, loadFlag);
  //console.log(JSON.stringify(body));
  //debug(`body is `+body);
  try{
    
    // let length = (yield getCount(initUrl,loadFlag)).pageCount;
    // debug(`page account is ${length}`);

    // for(let i=0;i<=length-1;i++){
    //   console.log(`keeping all the form data needed to get each page in the db `);
    //   let formContents = {};
    //   formContents.__go2pageNO = i + 1;
    //   formContents.__go2pageNum = i;
    //   formContents.done = true;
    //   let link = new MLink(formContents);
    //   link.save();
    // }
    require('src/jobs/keepFormData');
    
    let mLink = MLink.find({}).cursor();
    for(let doc = yield mLink.next(); doc != null; doc = yield mLink.next()){
      let formContent = {
        __go2pageNO: doc.__go2pageNO,
        leibie: doc.leibie,
        key1: doc.key1,
        __go2pageNum: doc.__go2pageNum,
        done: true
      };

      let body = yield getBody(initUrl, 'POST',{},formContent,{}, loadFlag, 'gb2312', true);
      //debug(`body in every page: ${body}`);
      let href= yield getHrefAndStore(body);
      if(href===''){
        continue;
      }
       
      console.log(`href: ${href}`);


    }


  }catch(err){
    console.log(err);
  }



  // let __go2pageNO = 1;
  // let leibie = 'CORP_NAME';
  // let key1 = '';
  // let __go2pageNum = 2;


});










// request.get(initUrl,function(error, response, body){
//   if (!error && response.statusCode == 200) {
//     console.log(body); // Show the HTML for the Google homepage.
//     let productCount = parseInt(body.match(/共(\d+)条/)[1]);
//     let pageCount = parseInt(body.match(/第\s*(\d+)页/)[1]);
//     console.log(`productCount: ${productCount}, pageCount: ${pageCount}`);
//   }    


// });
