const web3 =  require("@solana/web3.js");
require('dotenv').config();
const fs = require('fs');
const tools = require('./tools');

var Create_Account = (async => {
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl(process.env.BLOCKCHAIN_NETWORK),
    'confirmed',
  );

  // Generate a new random public key
  const key_pairs = web3.Keypair.generate();
  
  const arr_private_key = key_pairs._keypair.secretKey;
  const text_secret = tools.Uint8Array_To_String(arr_private_key);

  return [text_secret, String(key_pairs.publicKey)];
})

module.exports = {Create_Account};