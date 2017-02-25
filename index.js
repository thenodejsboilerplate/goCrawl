'use strict';
require('app-module-path').addPath(__dirname);
require('src/boot');
//const cluster = require('cluster');
//const co = require('co');
//const errorDebug = require('debug')('error');
const coHandler = require('src/common/co-handler');
const config = require('src/common/get-config');
const crawlers = config.crawlers;
const keys = Object.keys(crawlers);

function startJob(job) {
  return coHandler(function *() {
    yield job.start();
  });
  // .catch(e => {
  //   errorDebug(e);
  //   process.exit(-1);
  // });
}
coHandler(function *() {
  for(let key of keys) {
    const crawler = crawlers[key];
    if(crawler.run === true) {
      const jobs = [];
      const jobFiles = Object.keys(crawler.jobsConfig);
      console.log(`jobFiles: ${require('util').inspect(jobFiles)}`);

      for(let jobFile of jobFiles) {
        const Job = require(jobFile);
        const job = new Job(crawler);//job with properties got from config file in config.crawlers
        jobs.push(job);
      }

      for(let job of jobs) {
        let i = 1;
        console.log('into turn'+ i);
        yield startJob(job);
        i++;
      }
    }
  }
});



// 'use strict';
// require('app-module-path').addPath(__dirname);
// const	debug = require('debug')('debug');
// const	config = require('src/common/get-config');
// const	bodyParser = require('body-parser');
// const	expressValidator = require('express-validator');
// const	mongoose = require('mongoose');
// const	express = require('express');
// require('src/common/mongoose-connect');


// const	app = express(); 
// app.use(bodyParser.json());
// app.use(expressValidator());// this line must be immediately after any of the bodyParser middlewares!

// require('src/routes')(app);
// app.use(function(req,res,next){
//   res.status(404);
//   res.json('404');
// });

// app.use(function(err,req,res,next){
//   res.json('505');
// });

// app.listen(config.port, function(){
//   console.log(`Express started on http://localhost + ${config.port} ;press Ctrl-C to terminate`);
// });
// module.exports = app;
