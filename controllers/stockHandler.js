var expect = require('chai').expect;
var MongoClient = require('mongodb');
let stockQuote=require("stock-quote");

const CONNECTION_STRING = process.env.DB;

let StockHandler = (req,stock)=>{
  return new Promise((resolve,reject)=>{
    stockQuote.getQuote(stock)
      .then((data)=>{//if stock exist
        let like=(req.query.like=="true")
        MongoClient.connect(CONNECTION_STRING,{useNewUrlParser:true},(err,client)=>{ //check aggregation on mongodb
          if(err) throw err;
          const db=client.db("StockPriceChecker");
          db.collection('ipList').findOne({ip:req.ip},(err,ipResult)=>{
            if(err) throw err;
            if(ipResult) {//ip is in database?
              if(like&&(!ipResult.liked.includes(stock))){//has ip yet to like this stock?
                console.log("old ip new like  ");
                db.collection('stockData')
                  .findOneAndUpdate({stock:stock},
                                    {$inc:{likes:1}},
                                    {returnOriginal:false,
                                     upsert:true},
                                    (err,response)=>{
                    if(err) throw err;

                    let result=response.value;
                    delete result._id;
                    result.price=data.currentPrice;
                    console.log(result);
                    resolve(result);

                    db.collection('ipList').findOneAndUpdate({ip:req.ip},{$push:{liked:stock}},(err,result)=>{
                      if(err) throw err;
                      client.close();
                    })
                })
              } else {
                console.log("old ip no like  ");
                db.collection('stockData')
                  .findOne({stock:stock}, (err,result)=>{
                    if(err) throw err;
                    if(result){
                      delete result._id;
                      result.price=data.currentPrice;
                      console.log(result);
                      resolve(result);
                    } else {
                      let result={
                        stock:stock,
                        price:data.currentPrice,
                        likes:0
                      }
                      console.log(result);
                      resolve(result);
                    }
                    client.close();
                })
              }
            } else {
              if(like){
                console.log("new ip new like ");
                db.collection('stockData')
                  .findOneAndUpdate({stock:stock},
                                    {$inc:{likes:1}},
                                    {returnOriginal:false,
                                     upsert:true},
                                    (err,response)=>{
                    if(err) throw err;
                    let result=response.value;
                    result.price=data.currentPrice;
                    delete result._id;
                    console.log(result);

                    db.collection('ipList').insertOne({ip:req.ip,
                                                       liked:[stock]},(err,response)=>{
                      if(err) {
                        throw err;
                      }
                      resolve(result);
                      client.close();
                    })
                })
              } else {
                console.log("new ip no like  ");
                db.collection('stockData')
                  .findOne({stock:stock}, (err,result)=>{
                    if(err) throw err;
                    if(result){
                      delete result._id;
                      result.price=data.currentPrice;
                      console.log(result);
                      resolve(result);
                    } else {
                      let result={
                        stock:stock,
                        price:data.currentPrice,
                        likes:0
                      }
                      console.log(result);
                      resolve(result);
                    }
                    client.close();
                })
              }
            }
          })
        })
      },(err)=>{
      //if it doesn't
        resolve( "Could not find stock")
    })
  })
}

module.exports = StockHandler
