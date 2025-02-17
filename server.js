'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');

const helmet=require('helmet')

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

//Set the content security policies to only allow loading of scripts and css from your server.
app.use(helmet.contentSecurityPolicy({
  directives:{
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"]
  }
}))

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    if(req.query.delete=="true"){
      var MongoClient = require('mongodb');
      const CONNECTION_STRING = process.env.DB;
      MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true},(err,client)=>{
      if(err) throw err;
      const db=client.db("StockPriceChecker");
      db.collection('stockData').deleteMany({},(err,result)=>{
        if(err) throw err;
        db.collection('ipList').deleteMany({},(err,result)=>{
          if(err) throw err;
          res.send('deleted');
          client.close()
        });
      });
      
    })
    } else {
      res.sendFile(process.cwd() + '/views/index.html');
    }
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing

          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
