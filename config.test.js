module.exports = {
  port: process.env.SPIDER_API_PORT || 8005,
  mongodb: {
    dbname: 'crawler',
    host: 'localhost',//'192.168.3.148',//10.184.1.209
    port:27017,
    user:'',
    pass: '',
    uri: 'mongodb://localhost:27017/crawler',//'mongodb://10.184.1.209:27017/crawler',
    options: {
      server: {
        poolSize: 5,
      },
    },
  },
  crawlers: {
    instance: {
      run: true, //是否启动该爬虫
      strategy: 'continue', //爬虫策略 restart or continue
      website: 'zjfda',
      identifier: 'myInstance',
      jobsConfig: {
        'src/jobs/instance/KeepFormData.js': {
        },
        'src/jobs/instance/GetCorpDetail.js': {
        },
      },
      // jobStatus: {
      //   qxjyJob: false,
      //   keepFromData: false,
      // },
      __go2pageNO_Init: 1,
      __go2pageNum_Init: 0,
      initUrl: 'http://www.zjfda.gov.cn/sjcx/qxjy_xzspsearch.jsp',
      detailPageBase: 'http://www.zjfda.gov.cn/sjcx',
      aliveLoadFlag: 'table'
    }
  },

};
