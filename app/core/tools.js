const { time } = require('console');
const fs = require('fs');

function read (path){
    try {
        const data = fs.readFileSync(path, 'utf8')
        return data;
      } catch (err) {
        //console.error(err)
      }
}

function writeFile(name, content){
    fs.writeFile(name, content, (err) => {
        //if (err) throw err;
        console.log(name + ' saved');
        });
}

function String_To_Uint8Array(public, nb_elements){
    let arr = new Uint8Array(nb_elements);
    let word = "";
    let arr_index = 0;
    for (let index = 0; index < public.length+1; index++) {
        if (public[index] == "," || index == public.length) {
            arr[arr_index] = word;
            word = "";
            arr_index += 1;
        }
        else{
            word = word + public[index];
        }
    }
    return arr;
}

function Uint8Array_To_String(arr){
    let text_public = "";
    for (let index = 0; index < arr.length; index++) {
        if (index == 0) {
            text_public = arr[index];
        }
        else
            text_public = text_public +","+ arr[index];
    }
    return text_public;
}

function Get_files_From_Folder(path){
    var files = fs.readdirSync(path);
    return files;
}

function Get_Last_Transaction_Number(path){
    var files = Get_files_From_Folder(path)
    var max_order_nb = 0;
    for (let index = 0; index < files.length; index++) {
        var order_nb = "";
        for (let index2 = 0; index2 < (files[index].length)-4; index2++) {
            order_nb = order_nb + files[index][index2];  
        }
        if (Number(order_nb) > max_order_nb) 
            max_order_nb = Number(order_nb);
    }
    return max_order_nb
}

function Get_Created_Date(path){  
    const { birthtime } = fs.statSync(path)
    return birthtime
}

function Time_Remaining(path){
    var creation_time = Get_Created_Date(path);
    function toTimestamp(strDate){
        var datum = Date.parse(strDate);
        return datum/1000;
       }
    var creation_timestamp = toTimestamp(creation_time);
    var expiration = creation_timestamp + 3600;
    var time_left = Math.trunc(expiration - (Date.now()/1000));
    if (time_left > 0){
        return String(Math.trunc(time_left/60))+" min "+String(time_left%60)+" sec";
    }
    else{
        return 0;
    }
}

function PublicKey_From_OrderNb(order_nb){
    const private = read('../data/hot-wallet/private/'+order_nb+'.txt');
    let secretKey = String_To_Uint8Array(private, 64);
    
    const {Keypair} = require("@solana/web3.js");
    let wallet = Keypair.fromSecretKey(secretKey);
    return String(wallet.publicKey);
}

module.exports = { read, writeFile, String_To_Uint8Array, Uint8Array_To_String, Get_files_From_Folder, Get_Last_Transaction_Number, Get_Created_Date, Time_Remaining, PublicKey_From_OrderNb };