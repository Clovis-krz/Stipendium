require('dotenv').config();
const bcrypt = require('bcrypt');
const uuidAPIKey = require('uuid-apikey');
var jwt = require('jsonwebtoken');

//ENV VARIABLES
const saltRounds = Number(process.env.BCRYPT_SALT); //BCRYPT

const jwt_password = process.env.JWT_PASS; //JWT


//BCRYPT
function hash_password(password){
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function check_password(password, hash){
    return bcrypt.compareSync(password, hash);
}

//API KEYS
function create_API_key(){
    var api_key = uuidAPIKey.create();
    return api_key;
}

function is_Api_key(api_key){
    return uuidAPIKey.isAPIKey(api_key);
}

function check_API_key(from_user, from_server){
    if (!uuidAPIKey.isAPIKey(from_user)){
        return false;
    }
    else{
        return uuidAPIKey.check(from_user, from_server);
    }
}

function display_API_key(uuid){
    return uuidAPIKey.toAPIKey(uuid);
}

function API_key_to_uuid(api_key){
    return uuidAPIKey.toUUID(api_key);
}

//JSON WEB TOKEN

function sign_token(data){
    var token = jwt.sign(
        {
            data: data
        },
        jwt_password,
        { expiresIn: '1h' });
    return token;
}

function decode_token(token){
    try{
        var decoded = jwt.verify(token, jwt_password);
        return decoded.data;
    }
    catch(err){
        return false;
    }
}

module.exports = { hash_password, check_password, create_API_key, is_Api_key, check_API_key, display_API_key, API_key_to_uuid, sign_token, decode_token }