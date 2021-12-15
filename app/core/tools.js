const { time } = require('console');
const fs = require('fs');
const web3 =  require("@solana/web3.js");

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

function Lamports_To_SOL(lamports){
    return lamports/1000000000;
}

function SOL_To_Lamports(SOL){
    return SOL*1000000000;
}

module.exports = { String_To_Uint8Array, Uint8Array_To_String, Lamports_To_SOL, SOL_To_Lamports };