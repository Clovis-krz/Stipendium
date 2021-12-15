const { forEach } = require('lodash');
const mariadb = require('sync-mysql');
const connection = new mariadb({
     host: 'krzyzanowski.fr', 
     user:'stipendium', 
     password: 'ClovisestTropBo88!',
     database: "stipendium",
     port: "3307"
});


// GET Functions
function get_transaction_info(transaction_nb){
    var result = connection.query('SELECT transaction_nb, public_key, amount_total, amount_to_pay, currency, expiration, status, message FROM transactions WHERE transaction_nb='+transaction_nb);
    if (result.length > 0) {
        return result[0];
    }
    else{
        return false;
    }
}

function get_private(transaction_nb){
    var result = connection.query('SELECT private_key FROM transactions WHERE transaction_nb='+transaction_nb);
    if (result.length > 0) {
        return result[0].private_key;
    }
    else{
        return false;
    }
}

function get_transaction_status(transaction_nb){
    var result = connection.query('SELECT status, message FROM transactions WHERE transaction_nb='+transaction_nb);
    if (result.length > 0) {
        return result[0];
    }
    else{
        return false;
    }
}

function get_pending_transactions(){
    var result = connection.query('SELECT * FROM transactions WHERE status="pending"');
    if (result.length > 0) {
        return result;
    }
    else{
        return false;
    }
}

function get_expired_transactions(){
    var result = connection.query('SELECT * FROM transactions WHERE status="failed"');
    if (result.length > 0) {
        return result;
    }
    else{
        return [];
    }
}

function get_public_key_from_transaction_nb(transaction_nb){
    var info = connection.query('SELECT id_store FROM transactions WHERE transaction_nb='+transaction_nb);
    var result = connection.query('SELECT public_key FROM merchand WHERE id_store='+info[0].id_store);
    if (result.length > 0) {
        return result[0].public_key;
    }
    else{
        return false;
    }
}
function get_fees(){
    var result = connection.query('SELECT fees FROM blockchains WHERE name="solana"');
    return result[0].fees;
}

// BOOLEAN Functions
function is_transaction_expired(transaction_nb){
    var result = connection.query('SELECT expiration FROM transactions WHERE transaction_nb='+transaction_nb);
    if (result.length > 0) {
        if (result[0].expiration - Math.floor(Date.now()/1000) > 0) {
            return true;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

// UPDATE Functions
function update_fees(fees){
    var result = connection.query('UPDATE blockchains SET fees='+fees+' WHERE name="solana"');
    return result;
}

function update_amount_to_pay(transaction_nb, amount_to_pay){
    var result = connection.query('UPDATE transactions SET amount_to_pay='+amount_to_pay+' WHERE transaction_nb='+transaction_nb+'');
    return result;
}


// INSERT Functions
function add_transaction(id_store, private_key, public_key,amount, currency){
    var last_transaction = connection.query('SELECT MAX(transaction_nb) as nb FROM transactions');
    var transaction_nb = last_transaction[0].nb + 1;
    var amount_to_pay = amount;
    var expiration = (Math.floor(Date.now()/ 1000)) + 3600;
    var status = "pending";
    var result = connection.query("INSERT INTO transactions (id_store, transaction_nb, private_key, public_key, amount_total, amount_to_pay, currency, expiration, status, message) VALUES ('"+id_store+"', '"+transaction_nb+"', '"+private_key+"', '"+public_key+"','"+amount+"', '"+amount_to_pay+"', '"+currency+"', '"+expiration+"', '"+status+"', '')");
    return transaction_nb;
}

function transaction_paid(transaction_nb){
    var message = Math.floor(Date.now()/1000);
    var result = connection.query("UPDATE transactions SET status='paid', message='"+message+"' WHERE transaction_nb="+transaction_nb);
    return result;
}

function transaction_failed(transaction_nb, message){
    var message = String(Math.floor(Date.now()/1000)) +": "+ message;
    var result = connection.query("UPDATE transactions SET status='failed', message='"+message+"' WHERE transaction_nb="+transaction_nb);
    return result;
}

function register(public_key, api_key, name){
    var last_id_store = connection.query('SELECT MAX(id_store) as nb FROM merchand');
    var id_store = last_id_store[0].nb + 1;
    var result = connection.query("INSERT INTO merchand (id_store, api_key, public_key, name) VALUES ('"+id_store+"', '"+api_key+"', '"+public_key+"', '"+name+"')");
    return result;
}


// More complex functions

function update_expired_transactions(){
    var time = Math.floor(Date.now()/1000);
    var transactions = get_pending_transactions();
    if (transactions.length > 0) {
        transactions.forEach(transaction => {
            if (transaction.expiration < time) {
                transaction_failed(transaction.transaction_nb, "time elapsed");
                console.log("Transaction: "+transaction.transaction_nb+", Failed: time elapsed");
            }
        });
    }
}

module.exports = { get_transaction_info, get_private, get_transaction_status, get_pending_transactions, get_expired_transactions, get_public_key_from_transaction_nb, get_fees, is_transaction_expired, update_fees, update_amount_to_pay, add_transaction, transaction_paid, transaction_failed, register, update_expired_transactions };