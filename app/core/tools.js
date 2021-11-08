const fs = require('fs');

function read (path){
    try {
        const data = fs.readFileSync(path, 'utf8')
        return data;
      } catch (err) {
        console.error(err)
      }
}

function writeFile(name, content){
    fs.writeFile(name, content, (err) => {
        if (err) throw err;
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

module.exports = { read, writeFile, String_To_Uint8Array, Uint8Array_To_String };