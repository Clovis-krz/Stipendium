var cron = require('node-cron');
var routine = require('./routine');
const database = require('./database');
const express = require('express');
const account = require('./new-account');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/pay', (req, res, next) => {
    var amount = req.query.amount;
    var [private, public_key, transaction_nb] = account.Create_Account();
    var transaction_nb = database.add_transaction(1, private, public_key, amount, "SOL");
    res.redirect('/api/monitoring?ordernb='+transaction_nb);
  });

app.use('/api/payment-success', (req, res, next) => {
  res.status(200).json({payment_status: "success"});
})

app.use('/api/payment-failed', (req, res, next) => {
  const message = req.query.message;
  res.status(403).json({payment_status: message});
})

app.get('/api/monitoring', (req, res, next) => {
  const order_nb = req.query.ordernb;
  var transaction = database.get_transaction_info(order_nb);
  if (!transaction) {
    res.status(404).json({error: "transaction not found"});
  }
  else{

    if (transaction.status == "paid") {
      res.redirect('/api/payment-success');
    }
    else if (transaction.status == "failed"){
      res.redirect('/api/payment-failed?message='+transaction.message);
    }
    else{
        res.status(200).json(transaction);
    }
  }
})

module.exports = app;