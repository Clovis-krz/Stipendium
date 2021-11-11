const web3 =  require("@solana/web3.js");
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
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

function sleep(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
}

var Amount_Received = (async(order_nb) => {
    let res = await Info_account(order_nb);
    if (res == null) {
            //console.log("Transaction nb "+ order_nb + " not received");
            return 0;
    }
    else{
        let sol_received = Number(res.lamports)/1000000000;
        console.log("Order Nb "+order_nb+" : received : "+ sol_received+" SOL");
        return sol_received;
    }
})

module.exports = { Amount_Received };

