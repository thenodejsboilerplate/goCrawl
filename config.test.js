module.exports = {
  port: process.env.SPIDER_API_PORT || 8005,
  mongodb: {
    dbname: 'crawler',
    host: 'localhost', // '192.168.3.148',//10.184.1.209
    port: 27017,
    user: '',
    pass: '',
    uri: 'mongodb://localhost:27017/crawler', // 'mongodb://10.184.1.209:27017/crawler',
    options: {
      server: {
        poolSize: 5
      }
    }
  },
  crawlers: {
    // add your crawlers

  }

}
