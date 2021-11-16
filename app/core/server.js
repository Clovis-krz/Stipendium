const http = require('http');
const app = require('./app');
var cron = require('node-cron');
const fs = require('fs');
const { time } = require('console');
const express = require('express');
const account = require('./new-account');
const monitoring = require('./monitoring');
const transfer = require('./transfer');
const tools = require('./tools');
const transaction_history = require('./transaction_history');

cron.schedule('* * * * *', () => {
  const path = '../data/hot-wallet/private/';
  var files = tools.Get_files_From_Folder(path);
  for (let index = 0; index < files.length; index++) {
    var order_nb = "";
    for (let index2 = 0; index2 < (files[index].length)-4; index2++) {
        order_nb = order_nb + files[index][index2];  
    }
    var time_left = tools.Time_Remaining(path+order_nb+".txt");
    monitoring.Amount_Received(order_nb).then(money_received => {
      var price = Number(tools.read('../data/transactions/price-'+order_nb+'.txt'));
      var fees = monitoring.Get_Fees();
      var to_refund = money_received - price - 2*fees;
      var merchand_address = tools.read('../data/hot-wallet/merchand_public_address.txt');
      if (time_left == 0 && money_received < price && money_received > 2*fees){
        transaction_history.Refund_customer(order_nb, money_received - fees);
        console.log('transaction '+order_nb+', '+(money_received - fees)+' refunded');
      }
      else if (time_left == 0 && money_received >= price) {
        if (to_refund > 2*fees) {
          transaction_history.Refund_customer(order_nb, to_refund);
          console.log('transaction '+order_nb+', '+to_refund+' refunded');
        }
        transfer.Send_Money_To_Merchand(merchand_address, order_nb, price - fees);
        tools.writeFile('../data/transactions/status-'+order_nb+'.txt', "paid");
      }
      else if (time_left == 0 || tools.read('../data/transactions/status-'+order_nb+'.txt') == "paid") {
        fs.unlinkSync(path+order_nb+'.txt');
        fs.unlinkSync('../data/transactions/price-'+order_nb+'.txt');
      }
      else{
        console.log('transaction '+order_nb+' transaction still pending');
      }
    });
  }
});

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
