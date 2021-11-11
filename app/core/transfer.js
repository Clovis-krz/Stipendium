const web3 =  require("@solana/web3.js");
const fs = require('fs');
const tools = require('./tools.js');

var Send_Money_To_Merchand = (async (send_to_public_address, order_nb, amount) => {
  const web3 =  require("@solana/web3.js");

  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );
  const secret = tools.read('../data/hot-wallet/private/'+order_nb+'.txt');;
  let secretKey = tools.String_To_Uint8Array(secret, 64);
  const {Keypair} = require("@solana/web3.js");
  let from = Keypair.fromSecretKey(secretKey);
  let base58publicKey = new web3.PublicKey(send_to_public_address);

  // Add transfer instruction to transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: base58publicKey,
      lamports: 1000000000*amount,//web3.LAMPORTS_PER_SOL / 100,
    }),
  );

  // Sign transaction, broadcast, and confirm
  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from],
  );
  console.log('Transaction Nb '+order_nb+' : '+'Sent '+ amount +' SOL to '+send_to_public_address+' , Signature of the transaction : ', signature);
})

module.exports = { Send_Money_To_Merchand };
