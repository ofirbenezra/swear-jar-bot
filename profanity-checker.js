
var axios = require("axios").default;
const addtionalWords = [
    'wtf', 'stfu', 'lmfao', 'af', 'roflmao', 
    'lmao', 'fml', 'gtfo', 'omfg', 'pita'
    // 'stfu', 'gtfo', 
    // 'atfo', 'cya', 'rtfm', 'dtf', 'snb', 'bfr', 'milf',
    // 'fyfi', 'mofo', 'mofos'
];

const checkProfanityInText = (textForCheck) => {
    var options = {
        method: 'GET',
        url: 'https://www.purgomalum.com/service/json',
        params: { text: textForCheck, add: addtionalWords.toString() }
    };

    return axios.request(options).then(function (response) {
        return response.data.result;
    }).catch(function (error) {
        console.error(error);
    });
}

console.log(checkProfanityInText('hhhs'));

module.exports = {
    checkProfanityInText
}