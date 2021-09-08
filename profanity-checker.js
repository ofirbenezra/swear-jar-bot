
var axios = require("axios").default;

const checkProfanityInText = (textForCheck) => {
    var options = {
      method: 'GET',
      url: 'https://www.purgomalum.com/service/json',
      params: {text: textForCheck}
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