const { forEach } = require('lodash');
require('dotenv').config();
var SqlString = require('sqlstring');
const crypto = require('./crypto');
const mariadb = require('sync-mysql');
const e = require('express');
const connection = new mariadb({
     host: process.env.DB_HOST, 
     user:process.env.DB_USER, 
     password: process.env.DB_PASS,
     database: process.env.DB_NAME,
     port: process.env.DB_PORT
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
        return [];
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
    id_store = SqlString.escape(id_store);
    private_key = SqlString.escape(private_key);
    public_key = SqlString.escape(public_key);
    currency = SqlString.escape(currency);
    var last_transaction = connection.query('SELECT MAX(transaction_nb) as nb FROM transactions');
    var transaction_nb = last_transaction[0].nb + 1;
    var amount_to_pay = SqlString.escape(amount);
    amount = SqlString.escape(amount);
    var expiration = SqlString.escape((Math.floor(Date.now()/ 1000)) + 3600);
    var status = "pending";
    var result = connection.query("INSERT INTO transactions (id_store, transaction_nb, private_key, public_key, amount_total, amount_to_pay, currency, expiration, status, message) VALUES ("+id_store+", "+transaction_nb+", "+private_key+", "+public_key+", "+amount+", "+amount_to_pay+", "+currency+", "+expiration+", '"+status+"', '')");
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

// More complex functions

function update_expired_transactions(){
    var time = Math.floor(Date.now()/1000);
    var transactions = get_pending_transactions();
    transactions.forEach(transaction => {
        if (transaction.expiration < time) {
            transaction_failed(transaction.transaction_nb, "time elapsed");
            console.log("Transaction: "+transaction.transaction_nb+", Failed: time elapsed");
        }
    });
}

//ACOUNT MANAGEMENT

function create_account(email, clear_password, firstname, lastname, store_name){
    firstname = SqlString.escape(firstname);
    lastname = SqlString.escape(lastname);
    store_name = SqlString.escape(store_name);
    if (email != "undefined" && email != "" && clear_password !="" && clear_password != "undefined" && firstname != "undefined" && lastname != "undefined" && store_name != "undefined") {
        var does_exist = connection.query('SELECT merchand_email FROM merchand');
        var found = false;
        does_exist.forEach(element => {
            if (element.merchand_email == email) {
                found = true;;
            }
        })
        if (!found) {
            var last_id_store = connection.query('SELECT MAX(id_store) as nb FROM merchand');
            var id_store = last_id_store[0].nb + 1;
            var password = crypto.hash_password(clear_password);
            password = SqlString.escape(password);
            email = SqlString.escape(email);
            var result = connection.query("INSERT INTO merchand (id_store, api_key, public_key, merchand_pass, merchand_email, merchand_firstname, merchand_lastname, store_name) VALUES ('"+id_store+"', 'NONE', 'NONE', "+password+", "+email+", "+firstname+", "+lastname+", "+store_name+")");
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
function get_account(email){
    email = SqlString.escape(email);
    var account = connection.query("SELECT public_key, merchand_email, merchand_firstname, merchand_lastname, store_name FROM merchand WHERE merchand_email="+email);
    if (account.length > 0) {
        return account[0];
    }
    else{
        return false;
    }
}

function delete_account(email, password){
    email = SqlString.escape(email);
    var password_db = connection.query("SELECT merchand_pass FROM merchand WHERE merchand_email="+email);
    if (password_db[0]) {
        if (crypto.check_password(password, password_db[0].merchand_pass)) {
            var result = connection.query("DELETE FROM merchand WHERE merchand_email="+email);
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

function login(email, password){
    email = SqlString.escape(email);
    var account = connection.query("SELECT * FROM merchand WHERE merchand_email="+email);
    if (account[0]) {
        return crypto.check_password(password, account[0].merchand_pass);
    }
    else{
        return false;
    }
}

function update_merchand_info(email, to_update, value){
    if (to_update == "merchand_email" || to_update == "merchand_firstname" || to_update == "merchand_lastname" || to_update == "store_name") {
        email = SqlString.escape(email);
        var element = SqlString.escapeId(to_update);
        value = SqlString.escape(value);
        var result = connection.query("UPDATE merchand SET "+element+"="+value+" WHERE merchand_email="+email);
        return true;
    }
    else{
        return false;
    }
}

function update_password(email, password, new_password){
    email = SqlString.escape(email);
    var password_db = connection.query("SELECT merchand_pass FROM merchand WHERE merchand_email="+email);
    if (password_db[0]) {
        if (crypto.check_password(password, password_db[0].merchand_pass)) {
            var new_hashed_password = SqlString.escape(crypto.hash_password(new_password));
            var result = connection.query("UPDATE merchand SET merchand_pass="+new_hashed_password+" WHERE merchand_email="+email);
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

function update_wallet(email, new_wallet_address, password){
    email = SqlString.escape(email);
    new_wallet_address = SqlString.escape(new_wallet_address);
    var password_db = connection.query("SELECT merchand_pass FROM merchand WHERE merchand_email="+email);
    if (password_db[0]) {
        if (crypto.check_password(password, password_db[0].merchand_pass)) {
            var result = connection.query("UPDATE merchand SET public_key="+new_wallet_address+" WHERE merchand_email="+email);
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

function add_API_key(email){
    email = SqlString.escape(email);
    var api_key = crypto.create_API_key();
    var result = connection.query("UPDATE merchand SET api_key='"+api_key.uuid+"' WHERE merchand_email="+email);
    return api_key.apiKey;
}

function get_API_key(email){
    email = SqlString.escape(email);
    var result = connection.query("SELECT api_key FROM merchand WHERE merchand_email="+email);
    var api_key = crypto.display_API_key(result[0].api_key);
    return api_key;
}

function get_store_from_API_key(user_api_key){
    if (bcrypt.is_Api_key(user_api_key)) {
        var uuid = crypto.API_key_to_uuid(user_api_key);
        var result = connection.query("SELECT id_store FROM merchand WHERE api_key='"+uuid+"'");
        if (result.length > 0) {
            return result[0].id_store;
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

module.exports = { 
    get_transaction_info, 
    get_private, 
    get_transaction_status, 
    get_pending_transactions, 
    get_expired_transactions, 
    get_public_key_from_transaction_nb, 
    get_fees, 
    is_transaction_expired, 
    update_fees, 
    update_amount_to_pay, 
    add_transaction, 
    transaction_paid, 
    transaction_failed, 
    update_expired_transactions,
    create_account,
    get_account,
    delete_account,
    login,
    update_merchand_info,
    update_password,
    update_wallet,
    add_API_key,
    get_API_key,
    get_store_from_API_key 
};