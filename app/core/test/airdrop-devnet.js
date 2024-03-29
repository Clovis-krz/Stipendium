const web3 =  require("@solana/web3.js");
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const tools = require('../tools');

(async (send_to_public_address) => {
    // Connect to cluster
    const connection = new web3.Connection(
      web3.clusterApiUrl(process.env.BLOCKCHAIN_NETWORK),
      'confirmed',
    );

    /*const private = tools.read('../../data/hot-wallet/private/7.txt');
    let secretKey = tools.String_To_Uint8Array(private, 64);
    
    const {Keypair} = require("@solana/web3.js");
    let from = Keypair.fromSecretKey(secretKey);*/
    let from = new web3.PublicKey(send_to_public_address);

    console.log("Public Key of the airdrop : " + String(from));

    const airdropSignature = await connection.requestAirdrop(
        from,
        web3.LAMPORTS_PER_SOL,
      );
      await connection.confirmTransaction(airdropSignature);

    console.log("airdrop complete");
})('Bnq5W4aD2NsaG1aWuJTemP1Fshdu4bwAreLNLzzzTaQH');
