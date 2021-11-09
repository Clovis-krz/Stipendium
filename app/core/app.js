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
    var [public_key, transaction_nb] = account.Create_Account();
    const transaction_info = {
        publicKey : {public_key},
        order_Nb : {transaction_nb}
    } 
    res.status(200).json(transaction_info);
  });

module.exports = app;