
var axios = require("axios").default;
const dbManager = require('./db-manager');

const addtionalWords = [
    'wtf', 'stfu', 'lmfao', 'af', 'roflmao', 
    'lmao', 'fml', 'gtfo', 'omfg', 'pita'
    // 'stfu', 'gtfo', 
    // 'atfo', 'cya', 'rtfm', 'dtf', 'snb', 'bfr', 'milf',
    // 'fyfi', 'mofo', 'mofos'
];

//TODO : remove
const dic = {
'arse' : 1,
'arsehole': 1,
'ass': 1,
'asses': 1,
'assface': 1,
'assfaces' : 1,
'asshole' : 1,
'assholes' : 1,
'bastard' : 1,
'bastards' : 1,
'beaner' : 1,
'bellend' : 1,
'bint' : 1,
'bitch' : 1,
'bitches' : 1,
'bitchy' : 1,
'blowjob' : 1,
'blump' : 1,
'blumpkin' : 1,
'bollocks' : 1,
'bollox' : 1,
'boner' : 1,
'bukkake' : 1,
'bullshit' : 1,
'bunghole' : 1,
'buttcheeks' : 1,
'butthole' : 1,
'buttpirate' : 1,
'buttplug' : 1,
'carpetmuncher' : 1,
'chinc' : 1,
'chink' : 1,
'choad' : 1,
'chode' : 1,
'circlejerk' : 1,
'clit' : 1,
'clunge' : 1,
'cock' : 1,
'cocksucker' : 1,
'cocksuckers' : 1,
'cocksucking' : 1,
'coochie' : 1,
'coochy' : 1,
'coon' : 1,
'cooter' : 1,
'cornhole' : 1,
'cum' : 1,
'cunnie' : 1,
'cunt' : 1,
'cunts' : 1,
'dago' : 1,
'dic' : 1,
'dick' : 1,
'dickhead' : 1,
'dickheads' : 1,
'dik' : 1,
'dike' : 1,
'dildo' : 1,
'doochbag' : 1,
'doosh' : 1,
'douche' : 1,
'douchebag' : 1,
'dumbass' : 1,
'dumbasses' : 1,
'dyke' : 1,
'fag' : 1,
'fagget' : 1,
'faggit' : 1,
'faggot' : 1,
'faggots' : 1,
'fagtard' : 1,
'fanny' : 1,
'feck' : 1,
'felch' : 1,
'feltch' : 1,
'figging' : 1,
'fingerbang' : 1,
'frotting' : 1,
'fuc' : 1,
'fuck' : 1,
'fucked' : 1,
'fuckedup' : 1,
'fucker' : 1,
'fuckers' : 1,
'fucking' : 1,
'fuckoff' : 1,
'fucks' : 1,
'fuckup' : 1,
'fudgepacker' : 1,
'fuk' : 1,
'fukker' : 1,
'fukkers' : 1,
'fuq' : 1,
'gangbang' : 1,
'gash' : 1,
'goddamn' : 1,
'goddamnit' : 1,
'gokkun' : 1,
'gooch' : 1,
'gook' : 1,
'guido' : 1,
'heeb' : 1,
'honkey' : 1,
'hooker' : 1,
'jackass' : 1,
'jackasses' : 1,
'jackoff' : 1,
'jap' : 1,
'jerkoff' : 1,
'jigaboo' : 1,
'jiggerboo' : 1,
'jizz' : 1,
'junglebunny' : 1,
'kike' : 1,
'knobbing' : 1,
'kooch' : 1,
'kootch' : 1,
'kraut' : 1,
'kyke' : 1,
'lesbo' : 1,
'lezzie' : 1,
'milf' : 1,
'minge' : 1,
'motherfucker' : 1,
'motherfuckers' : 1,
'motherfucking' : 1,
'muff' : 1,
'muffdiver' : 1,
'muffdiving' : 1,
'munging' : 1,
'munter' : 1,
'ngga' : 1,
'niga' : 1,
'nigga' : 1,
'nigger' : 1,
'niggers' : 1,
'niglet' : 1,
'nigr' : 1,
'paki' : 1,
'panooch' : 1,
'pecker' : 1,
'peckerhead' : 1,
'pillock' : 1,
'piss' : 1,
'pissed' : 1,
'pollock' : 1,
'poon' : 1,
'poonani' : 1,
'poonany' : 1,
'poontang' : 1,
'porchmonkey' : 1,
'prick' : 1,
'punani' : 1,
'punanny' : 1,
'punany' : 1,
'pussie' : 1,
'pussies' : 1,
'pussy' : 1,
'puta' : 1,
'puto' : 1,
'quim' : 1,
'raghead' : 1,
'ruski' : 1,
'schlong' : 1,
'scrote' : 1,
'shag' : 1,
'shit' : 1,
'shite' : 1,
'shithead' : 1,
'shitheads' : 1,
'shits' : 1,
'shittier' : 1,
'shittiest' : 1,
'shitting' : 1,
'shitty' : 1,
'skank' : 1,
'skeet' : 1,
'slag' : 1,
'slanteye' : 1,
'slut' : 1,
'smartass' : 1,
'smartasses' : 1,
'smeg' : 1,
'snatch' : 1,
'spic' : 1,
'spick' : 1,
'splooge' : 1,
'spooge' : 1,
'teabagging' : 1,
'tit' : 1,
'tities' : 1,
'tits' : 1,
'titties' : 1,
'titty' : 1,
'tosser' : 1,
'towelhead' : 1,
'twat' : 1,
'vibrator' : 1,
'wank' : 1,
'wanker' : 1,
'wetback' : 1,
'whore' : 1,
'wiseass' : 1,
'wiseasses' : 1,
'wop': 1
};

let swearDict;

// const addSwearsToDB = () => {
//     dbManager.addSwearsToDic(dic).then(a => {
//         console.log(a);
//     })
// }

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

const checkProfanityInText = (textForCheck) => {
    const stripped = textForCheck.toLowerCase().replace(new RegExp(/(\*+)/, "g"), "").replace(/[\W_]+/g," ");
    const wordsToCheck = stripped.split(' ');
    let found = false;
    // return new Promise((resolve, reject) => {
        if(Object.keys(swearDict).length > 0) {    
            for (let word of wordsToCheck) {
                if(swearDict[word] === 1) {
                    // resolve(true);
                    found = true;
                    break;
                }
            }
        }
        return found; 
        // else {
        //     getSwearsFromDB().then(res => {
        //         wordsToCheck.forEach(word => {
        //             if(swearDict.indexOf(word) > -1) {
        //                 // resolve(true);
        //                  return true;
        //             }
        //         });
        //         // resolve(false);
        //         return false;
        //     });
        // }
    // })    
}

const checkProfanityWithApi = (textForCheck) => {
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

getSwearsFromDB();


module.exports = {
    checkProfanityInText
}