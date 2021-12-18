var cron = require('node-cron');
const database = require('./database');
const monitoring = require('./monitoring');
const transfer = require('./transfer');
const transaction_history = require('./transaction_history');

setInterval(() => {
    var fees = database.get_fees();

    database.update_expired_transactions(); // Set all the expired pending transactions to failed

    const pending_transactions = database.get_pending_transactions(); // Get the pending transactions not expired
    pending_transactions.forEach(transaction => { // Apply changes on pending transaction in the database depending on the transaction status
        monitoring.Amount_Received(transaction.transaction_nb).then(money_received =>{
            var amount_total = Number(transaction.amount_total);
            var to_refund = money_received - amount_total - 2*fees;
            var merchand_address = database.get_public_key_from_transaction_nb(transaction.transaction_nb);
            if (money_received > (amount_total + 10*fees)){ //Money received is more than the amount + 10 times the fees, refund customer what's over
                database.transaction_paid(transaction.transaction_nb);
                database.update_amount_to_pay(transaction.transaction_nb, 0);
                transfer.Send_Money_To_Merchand(merchand_address, transaction.transaction_nb, amount_total - fees);
                transaction_history.Refund_customer(transaction.transaction_nb, to_refund - (3*fees));
                //console.log('transaction '+transaction.transaction_nb+', '+(to_refund - (3*fees))+' refunded');
            }
            else if (money_received >= amount_total) { // Money received is enough or over the amount but not enough to refund
                database.transaction_paid(transaction.transaction_nb);
                database.update_amount_to_pay(transaction.transaction_nb, 0);
                transfer.Send_Money_To_Merchand(merchand_address, transaction.transaction_nb, amount_total - fees);
                //console.log('transaction '+transaction.transaction_nb+', paid');
            }
            else if (amount_total > money_received){ // Money received is not enough, update money to send left
                database.update_amount_to_pay(transaction.transaction_nb, amount_total - money_received);
            }
        })
    });

    const expired_transactions = database.get_expired_transactions(); // Get the failed transactions
    expired_transactions.forEach(transaction => {
        monitoring.Amount_Received(transaction.transaction_nb).then(money_received => {
            if (money_received > 10*fees) { // If we received over 10 times the amount of fees, refund the customer
                transaction_history.Refund_customer(transaction.transaction_nb, money_received - (3*fees));
                //console.log('transaction '+transaction.transaction_nb+', '+(money_received - (3*fees))+' refunded');
            }
        })
    });
}, 3000);
