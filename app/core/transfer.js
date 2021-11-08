const web3 =  require("@solana/web3.js");
const fs = require('fs');
const tools = require('./tools.js');

(async (send_to_public_address, amount) => {
  const web3 =  require("@solana/web3.js");

  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );
  const secret = tools.read('../data/hot-wallet/private/secret_key.txt');;
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
  console.log('SIGNATURE', signature);
})('5XS5uQcHgnudpNePCY1yprYDMzkvp3Vry6skcTh9tLBG', 0.001); 
// replace string buy public address to send money to and number buy the amount to transfer
