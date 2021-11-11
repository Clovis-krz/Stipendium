const web3 =  require("@solana/web3.js");
const { read } = require("fs");
const tools = require('./tools');

var Info_account = (async (order_nb)=> {
    // Connect to cluster
    var connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed',
    );
    const private = tools.read('../data/hot-wallet/private/'+order_nb+'.txt');
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
        console.log("Order Nb "+order_nb+" : received : "+ sol_received+" SOL");
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
  tools.writeFile('../data/fees.txt', String(fees))
  return fees;
})

function Get_Fees(){
  Get_Fees_process();
  let fees = tools.read('../data/fees.txt');
  return fees;
}

module.exports = { Amount_Received, Get_Fees };

