const fetch = require('node-fetch')
const pgp_ = require('pg-promise')
const pgp = pgp_()
const readFile = require('fs').readFileSync;

const pw = process.env.pw

const cn = { host: 'pricesdb2.cerqhtf4ui7b.us-east-2.rds.amazonaws.com',
             port: 5432, database: 'postgres',
             user: 'postgres', password: pw }

const db = pgp(cn)

async function initDB() {
  const initSQL = readFile(__dirname+'/init.sql','utf8')
  console.log(initSQL)
  await db.any(initSQL)
}


async function dbquery(exchange) {
  let sql = 'select * from prices'
  console.log(await db.any(sql))
}

async function dbinsert({symbol, price}) {
  const vals = `('${symbol}', ${price})`
  const sql = `insert into quotes (symbol, price) values ${vals}`
  console.log({sql})
  await db.any(sql); 
}

async function parse(data) {
  let recs = data.quotes
  let res = []
  let list = 'USDEUR USDCAD USDJPY USDGBP USDCNY USDCHF USDAUD USDZAR USDKRW USDHKD'
  list = list.split(' ') 
  for ([key,val] of Object.entries(recs))
    if (list.includes(key)) res.push({symbol:key, price: val})
  return res
}

async function getQuotes(params) {
  let url = 'https://api.currencylayer.com/live?access_key=287cd9309544e39904696c25aa23f43b';
  let res = '';
  console.log("Trying to fetch from URL..")
  let response = await fetch(url);
  let data = await response.json();
  console.log("HTTP fetch complete.")
  let records = await parse(data);

  console.log(JSON.stringify(records,null,2));
  console.log("Awaiting insert into db")
  for (let rec of records) await dbinsert(rec);
  console.log("db insert complete")
  return JSON.stringify(records);
}

exports.handler = async (event) => {
    let text = await getQuotes(event)
    //let text = 'ok'
    //await initDB()
    //text = await dbquery()
    const response = {
        statusCode: 200,
        body: text,
    }
    return response
};

