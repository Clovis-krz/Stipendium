const web3 =  require("@solana/web3.js");
const fs = require('fs');
const tools = require('./tools');

var Create_Account = (async => {
  // Connect to cluster
  console.log(web3.clusterApiUrl('devnet'))
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );

  // Generate a new random public key
  const key_pairs = web3.Keypair.generate();

  //console.log(key_pairs);; //Display newly generated private key
  var max_nb = tools.Get_Last_Transaction_Number('../data/transactions/');
  var new_transaction_nb = max_nb + 1;
  
  const arr_private_key = key_pairs._keypair.secretKey;
  const text_secret = tools.Uint8Array_To_String(arr_private_key);
  const name_secret = "../data/hot-wallet/private/"+new_transaction_nb+".txt";

  tools.writeFile(name_secret, text_secret);
  return [String(key_pairs.publicKey), new_transaction_nb];
})

module.exports = {Create_Account};