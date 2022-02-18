var cron = require('node-cron');
var routine = require('./routine');
const database = require('./database');
const crypto = require('./crypto');
const express = require('express');
const account = require('./new-account');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// ACCOUNT MANAGEMENT
app.get('/api/login', (req, res, next) => {
  var valid = database.login(req.query.email, req.query.password);
  if (valid) {
    var token = crypto.sign_token(req.query.email);
    res.status(200).json({login_status: "success", token: token});
  }
  else{
    res.status(400).json({login_status: "error"});
  }
})

app.get('/api/display-account', (req, res, next) => {
  var token_data = crypto.decode_token(req.query.token);
  if (token_data) {
    var account = database.get_account(token_data);
    if (account) {
      res.status(200).json({message: "success", account});
    }
    else{
      res.status(404).json({message: "error, account not found"})
    }
  }
  else{
    res.status(404).json({message: "error, account not found"});
  }
})

app.get('/api/create-account', (req, res, next) => {
  var account_creation = database.create_account(req.query.email, req.query.password, req.query.firstname, req.query.lastname, req.query.store_name);
  if (account_creation) {
    res.status(200).json({account_creation: "success"});
  }
  else{
    res.status(500).json({account_creation: "error"});
  }
})

app.get('/api/delete-account', (req, res, next) => {
  var password = req.query.password;
  var token_data = crypto.decode_token(req.query.token);
  if (token_data) {
    var deletion = database.delete_account(token_data, password);
    if (deletion) {
      res.status(200).json({account_deletion: "success"});
    }
    else{
      res.status(400).json({account_deletion: "failed, wrong password"});
    }
  }
  else{
    res.status(404).json({account_deletion: "error, not found"});
  }
})

app.get('/api/update-merchand-info', (req, res, next) => {
  var token_data = crypto.decode_token(req.query.token);
  var element = req.query.element;
  var value = req.query.value;
  if (token_data) {
    var updated = database.update_merchand_info(token_data, element, value);
    if (updated) {
      res.status(200).json({info_update: "successfully updated "+element+" to "+value});
    }
    else{
      res.status(400).json({info_update: "error, not allowed"});
    }
  }
  else{
    res.status(404).json({info_update: "error, account not found"});
  }
})

app.get('/api/update-password', (req, res, next) => {
  var token_data = crypto.decode_token(req.query.token);
  var password = req.query.password;
  var new_password = req.query.new_password;
  if (token_data) {
    var update = database.update_password(token_data, password, new_password);
    if (update) {
      res.status(200).json({password_update: "success"});
    }
    else{
      res.status(400).json({password_update: "error, incorrect password"});
    }
  }
  else{
    res.status(404).json({password_update: "error, account not found"});
  }
})

app.get('/api/update-wallet', (req, res, next) => {
  var token_data = crypto.decode_token(req.query.token);
  var password = req.query.password;
  if (token_data) {
    var update = database.update_wallet(token_data, req.query.wallet, password);
    if (update) {
      res.status(200).json({wallet_update: "success"});
    }
    else{
      res.status(400).json({wallet_update: "failed, wrong password"});
    }
  }
  else{
    res.status(404).json({wallet_update: "error, account not found"});
  }
})

app.get('/api/generate-api', (req, res, next) => {
  var token_data = crypto.decode_token(req.query.token);
  if (token_data) {
    var api_key = database.add_API_key(token_data);
    res.status(200).json({api_generation: "success", key: api_key});
  }
  else{
    res.status(404).json({wallet_update: "error, account not found"});
  }
})

app.get('/api/display-api', (req, res, next) => {
  var token_data = crypto.decode_token(req.query.token);
  if (token_data) {
    var api_key = database.get_API_key(token_data);
    res.status(200).json({message: "success", key: api_key});
  }
  else{
    res.status(404).json({message: "error, account not found"});
  }
})

// ADD TRANSACTION
app.use('/api/pay', (req, res, next) => {
    var api_key = req.query.key;
    var store_nb = database.get_store_from_API_key(api_key);
    if (store_nb) {
      var amount = req.query.amount;
      if (isNaN(amount)){
        res.status(404).json({error: "amount, not a number"});
      }
      else{
        if (parseFloat(amount) < 0.000065) {
          res.status(404).json({error: "amount is too small"});
        }
        else{
          var [private, public_key, transaction_nb] = account.Create_Account();
          var transaction_nb = database.add_transaction(store_nb, private, public_key, amount, "SOL");
          res.status(200).json({url: "http://localhost:8080/monitoring?transaction="+transaction_nb});
        }
      }
    }
    else{
      res.status(404).json({error: "API not recognized"});
    }
    
  });

// MONITOR A TRANSACTION
app.get('/api/monitoring', (req, res, next) => {
  const order_nb = req.query.ordernb;
  if (!Number.isInteger(Number(order_nb))) {
    res.status(404).json({error: "arguments not valid"});
  }
  else{
    var transaction = database.get_transaction_info(order_nb);
    if (!transaction) {
      res.status(404).json({error: "transaction not found"});
    }
    else{

      if (transaction.status == "paid") {
        res.status(200).json({transaction_nb: transaction.transaction_nb, payment_status: "success", message: transaction.message});
      }
      else if (transaction.status == "failed"){
        res.status(200).json({transaction_nb: transaction.transaction_nb, payment_status: "failed", message: transaction.message});
      }
      else{
          res.status(200).json(transaction);
      }
    }
  }
})

module.exports = app;