const web3 =  require("@solana/web3.js");
const database = require('./database');
const fs = require('fs');
const tools = require('./tools.js');

var Send_Money_To_Merchand = (async (send_to_public_address, order_nb, amount) => {
  const web3 =  require("@solana/web3.js");

  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );
  const secret = database.get_private(order_nb);
  let secretKey = tools.String_To_Uint8Array(secret, 64);
  const {Keypair} = require("@solana/web3.js");
  let from = Keypair.fromSecretKey(secretKey);
  let base58publicKey = new web3.PublicKey(send_to_public_address);

  // Add transfer instruction to transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: base58publicKey,
      lamports: tools.SOL_To_Lamports(amount),//web3.LAMPORTS_PER_SOL / 100,
    }),
  );

  // Sign transaction, broadcast, and confirm
  const signature = await web3.sendAndConfirmTransaction(connection, transaction, [from],)
  .then( res => {
    console.log('Transaction Nb '+order_nb+' : '+'Sent '+ amount +' SOL to '+send_to_public_address+' , Signature of the transaction : ', res)
  })
  .catch( err => {
    console.log("processus running...wait");
  });
})

module.exports = { Send_Money_To_Merchand };
