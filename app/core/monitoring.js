const web3 =  require("@solana/web3.js");
require('dotenv').config();
const database = require('./database');
const { read } = require("fs");
const tools = require('./tools');
const { get } = require("lodash");

var Info_account = (async (order_nb)=> {
    // Connect to cluster
    var connection = new web3.Connection(
      web3.clusterApiUrl(process.env.BLOCKCHAIN_NETWORK),
      'confirmed',
    );
    const private = database.get_private(order_nb);
    let secretKey = tools.String_To_Uint8Array(private, 64);
    
    const {Keypair} = require("@solana/web3.js");
    let wallet = Keypair.fromSecretKey(secretKey);
    
    // get account info
    // account data is bytecode that needs to be deserialized
    // serialization and deserialization is program specic
    let account = await connection.getAccountInfo(wallet.publicKey);
    return account;
  })

var Amount_Received = (async(order_nb) => {
    let res = await Info_account(order_nb);
    if (res == null) {
            //console.log("Transaction nb "+ order_nb + " not received");
            return 0;
    }
    else{
        let sol_received = tools.Lamports_To_SOL(Number(res.lamports));
        return sol_received;
    }
})

var Get_Fees_process = (async () => {
  var connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );
  let blockhash = await connection.getRecentBlockhash();
  let fees = await tools.Lamports_To_SOL(blockhash.feeCalculator.lamportsPerSignature);
  database.update_fees(fees);
  return fees;
})

function Get_Fees(){
  Get_Fees_process();
  let fees = database.get_fees();
  return fees;
}

module.exports = { Amount_Received, Get_Fees };

