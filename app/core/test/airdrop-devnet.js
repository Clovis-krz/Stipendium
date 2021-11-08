const web3 =  require("@solana/web3.js");
const fs = require('fs');
const tools = require('../tools');

(async () => {
    // Connect to cluster
    console.log(web3.clusterApiUrl('devnet'))
    const connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed',
    );

    const private = tools.read('../../data/hot-wallet/private/secret_key.txt');
    let secretKey = tools.String_To_Uint8Array(private, 64);
    
    const {Keypair} = require("@solana/web3.js");
    let from = Keypair.fromSecretKey(secretKey);
    console.log("Public Key of the airdrop : " + String(from.publicKey));

    const airdropSignature = await connection.requestAirdrop(
        from.publicKey,
        web3.LAMPORTS_PER_SOL,
      );
      await connection.confirmTransaction(airdropSignature);

    console.log("airdrop complete");
})();
