const web3 =  require("@solana/web3.js");
const { read } = require("fs");
const tools = require('./tools');
const transfer = require('./transfer');

var Get_Customer_Public_Address = (async (public_address)=> {
    var connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed',
    );
    let from = new web3.PublicKey(public_address);
    let signatures = await connection.getSignaturesForAddress(from);
    //console.log(signatures);
    let transactions = await connection.getConfirmedTransaction(signatures[0].signature);
    return String(transactions.transaction.feePayer);
  })

var Refund_customer = (async (order_nb, amount) => {
    let private = tools.read('../data/hot-wallet/private/'+order_nb+'.txt');
    let secretKey = tools.String_To_Uint8Array(private, 64);
    const {Keypair} = require("@solana/web3.js");
    let order_keypair = Keypair.fromSecretKey(secretKey);
    let order_public_address = String(order_keypair.publicKey);
    let customer_address = await Get_Customer_Public_Address(order_public_address);
    transfer.Send_Money_To_Merchand(customer_address, order_nb, amount);
})

module.exports = { Refund_customer };