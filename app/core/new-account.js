const web3 =  require("@solana/web3.js");
const fs = require('fs');
const tools = require('./tools');

(async () => {
  // Connect to cluster
  console.log(web3.clusterApiUrl('devnet'))
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );

  // Generate a new random public key
  const key_pairs = web3.Keypair.generate();

  //console.log(key_pairs);; //Display newly generated private key

  const arr_private_key = key_pairs._keypair.secretKey;
  const text_secret = tools.Uint8Array_To_String(arr_private_key);
  const name_secret = "../data/hot-wallet/private/secret_key.txt";

  const arr_public_key = key_pairs._keypair.publicKey;
  text_public = tools.Uint8Array_To_String(arr_public_key);
  const name_public = "../data/hot-wallet/public/public_key.txt";

  tools.writeFile(name_secret, text_secret);
  tools.writeFile(name_public, text_public);
})
();