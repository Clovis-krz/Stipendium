const { time } = require('console');
const express = require('express');
const account = require('./new-account');
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

module.exports = app;