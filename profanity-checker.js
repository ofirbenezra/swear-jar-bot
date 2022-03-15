
var axios = require("axios").default;
const dbManager = require('./db-manager');

let swearDict;
const addtionalWords = [
    'wtf', 'stfu', 'lmfao', 'af', 'roflmao', 
    'lmao', 'fml', 'gtfo', 'omfg', 'pita'
    // 'stfu', 'gtfo', 
    // 'atfo', 'cya', 'rtfm', 'dtf', 'snb', 'bfr', 'milf',
    // 'fyfi', 'mofo', 'mofos'
];

// const checkProfanityInText = (textForCheck) => {
//     var options = {
//         method: 'GET',
//         url: 'https://www.purgomalum.com/service/json',
//         params: { text: textForCheck, add: addtionalWords.toString() }
//     };

//     return axios.request(options).then(function (response) {
//         return response.data.result;
//     }).catch(function (error) {
//         console.error(error);
//     });
// }

const checkProfanityInText = (textForCheck) => {
    const stripped = textForCheck.toLowerCase().replace(new RegExp(/(\*+)/, "g"), "").replace(/[\W_]+/g, " ");
    const wordsToCheck = stripped.split(' ');
    let swearArr = [];
    if (Object.keys(swearDict).length > 0) {
        for (let word of wordsToCheck) {
            if (swearDict[word] === 1) {
                found = true;
                swearArr.push(word);
                break;
            }
        }
    }
    return swearArr;
}

const getSwearsFromDB = () => {
    console.log('Initializing swear dictionary from DB');
    return new Promise((resolve, reject) => {
        dbManager.getSwearsDic().then(res => {
            if(res) {
                swearDict = {...res};
                resolve(res);
            } else {
                resolve(swearDict)
            }
        })
    })
}

getSwearsFromDB();

module.exports = {
    checkProfanityInText
}