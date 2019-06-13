/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
let stockQuote=require("stock-quote");

const CONNECTION_STRING = process.env.DB;

module.exports = function (app) {
  
  let stockHandler=require("../controllers/stockHandler.js")
  
  app.route('/delete').get((req,res)=>{
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
  })
  
  app.route('/api/stock-prices')
  //I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData. XXXXXXXXXX
  //In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int). XXXXXXXXXXXX
  //I can also pass along field like as true(boolean) to have my like added to the stock(s). Only 1 like per ip should be accepted. XXXXXXXXXXXX
  //If I pass along 2 stocks, the return object will be an array with both stock's info but instead of likes, it will display rel_likes(the difference between the likes on both) on both.
  //A good way to receive current price is the following external API(replacing 'GOOG' with your stock): https://finance.google.com/finance/info?q=NASDAQ%3aGOOG
  //All 5 functional tests are complete and passing.
    .get(function (req, res){
      let stock=req.query.stock;
      let response;
      if(Array.isArray(stock)){
        stockHandler(req,stock[0].toUpperCase()).then((result1)=>{
          stockHandler(req,stock[1].toUpperCase()).then((result2)=>{
            response=[result1,result2];
            if(typeof response[0]=='object' && typeof response[1]=='object'){
              let likeDiff=response[0].likes-response[1].likes;
              delete response[0].likes;
              response[0].rel_likes=likeDiff;
              delete response[1].likes;
              response[1].rel_likes=-likeDiff;
              console.log(response)
              res.json({stockData:response});
            } else {
              res.json({stockData:response});
            }
          })
        });
        
      } else {
        stockHandler(req,stock.toUpperCase()).then((response)=>{
          res.json({stockData:response});
        })
      }
    });
    
};
