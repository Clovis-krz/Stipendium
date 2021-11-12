const fs = require('fs');
const { time } = require('console');
const express = require('express');
const account = require('./new-account');
const monitoring = require('./monitoring');
const transfer = require('./transfer');
const tools = require('./tools');
const transaction_history = require('./transaction_history');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/pay', (req, res, next) => {
    var amount = req.query.amount;
    var [public_key, transaction_nb] = account.Create_Account();
    tools.writeFile('../data/transactions/price-'+transaction_nb+'.txt', amount);
    tools.writeFile('../data/transactions/status-'+transaction_nb+'.txt', "not paid");
    var time_left = tools.Time_Remaining('../data/hot-wallet/private/'+transaction_nb+'.txt');
    res.redirect('/api/monitoring?ordernb='+transaction_nb);
  });

app.use('/api/payment-success', (req, res, next) => {
  res.status(200).json({payment_status: "success"});
})

app.use('/api/payment-failed', (req, res, next) => {
  res.status(403).json({payment_status: "failed, time elapsed"});
})

app.use('/api/checking-payment', (req, res, next) => {
  var order_nb = req.query.ordernb;
  tools.writeFile('../data/transactions/status-'+order_nb+'.txt', "paid");
  res.redirect('/api/payment-success');
})

app.use('/api/monitoring', (req, res, next) => {
  const order_nb = req.query.ordernb;
  if (tools.read('../data/transactions/status-'+order_nb+'.txt') == "paid") {
    res.redirect('/api/payment-success');
  }
  else if (!fs.existsSync('../data/transactions/price-'+order_nb+'.txt') || !fs.existsSync('../data/hot-wallet/private/'+order_nb+'.txt')) {
    res.redirect('/api/payment-failed');
  }
  else{
    const public_key = tools.PublicKey_From_OrderNb(order_nb);
    const amount = Number(tools.read('../data/transactions/price-'+order_nb+'.txt'));
    var time_left = tools.Time_Remaining('../data/hot-wallet/private/'+order_nb+'.txt');
    if (time_left == 0) {
      res.redirect('/api/payment-failed');
    }
    else{
    monitoring.Amount_Received(order_nb).then(received => {
      var amount_to_pay = amount - received;
      if (amount_to_pay <= 0) {
        var amount_to_refund = 0;
        const merchand_address = tools.read('../data/hot-wallet/merchand_public_address.txt');
        if (amount_to_pay < 0 && (amount_to_pay*(-1)) > (2*monitoring.Get_Fees()) ) { //If customer sent more than required, send back what's over to customer
          amount_to_refund = (-1)*amount_to_pay - monitoring.Get_Fees();
          transaction_history.Refund_customer(order_nb, amount_to_refund);
        }
        const amount_to_transfer = received - amount_to_refund - (2*monitoring.Get_Fees());
        transfer.Send_Money_To_Merchand(merchand_address, order_nb, amount_to_transfer); //transfer from order_wallet to merchand wallet automatically
        res.redirect('/api/checking-payment?ordernb='+order_nb); //TODO send back if transaction failed
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
  }
}})

module.exports = app;