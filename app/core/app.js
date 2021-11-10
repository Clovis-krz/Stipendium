const { time } = require('console');
const express = require('express');
const account = require('./new-account');
const monitoring = require('./monitoring');
const transfer = require('./transfer');
const tools = require('./tools');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/pay', (req, res, next) => {
    var amount = req.amount;
    var [public_key, transaction_nb] = account.Create_Account();
    var time_left = tools.Time_Remaining('../data/hot-wallet/private/'+transaction_nb+'.txt');
    console.log(time_left);
    const transaction_info = {
        public_key,
        amount : '',
        currency : 'SOL',
        transaction_nb,
        time_left
    } 
    res.status(200).json(transaction_info);
  });

app.use('/api/monitoring', (req, res, next) => {
  const order_nb = req.query.ordernb;
  const public_key = tools.PublicKey_From_OrderNb(order_nb);
  const amount = 0.3;
  var time_left = tools.Time_Remaining('../data/hot-wallet/private/'+order_nb+'.txt');
  if (time_left == 0) {
    res.status(400).json({error: "time left, try again"});
  }
  else{
  monitoring.Amount_Received(order_nb).then(received => {
    var amount_to_pay = amount - received;
    if (amount_to_pay <= 0) {
      const merchand_address = tools.read('../data/hot-wallet/merchand_public_address.txt');
      const amount_to_transfer = received - 0.000005;
      transfer.Send_Money_To_Merchand(merchand_address, order_nb, amount_to_transfer);
      res.status(200).json({order_nb, transaction_status : "success"});
    }
    else{
      const transaction_info = {
        public_key,
        amount,
        amount_to_pay,
        currency : "SOL",
        time_left
      }
      res.status(200).json(transaction_info);
    }
  });
}})

module.exports = app;