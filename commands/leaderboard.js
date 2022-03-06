const { MessageEmbed } = require("discord.js");
const dbManager = require('../db-manager');


module.exports = {
    info: {
        name: "lead"
    },
    runner(msg, bot) {
        this.getLeaderBoardResults(msg.guildId).then(res => {
            if (res) {
                let table = '';
                res.forEach((element, index) => {
                    let row = `** ${index+1}. ** ${element.userName? element.userName : 'Anonymous'}:${element.swearCount} swears`; 
                    if(index === 0) {
                        row += ' 👑';
                    }
                    row += "\n"
                    table +=  row;
                });
            
                const msgEmbed = new MessageEmbed();
                if(table !== ''){
                    msgEmbed.setColor('#0099ff')
                    // .setTitle('SwearJar Bot Leader Board')
                    .addField('SwearJar Bot Leaderboard', table);                    
                } else{
                    msgEmbed.setColor('#0099ff')
                    // .setTitle('SwearJar Bot Leader Board')
                    .addField('SwearJar Bot Leaderboard', 'Empty');  
                }
                msg.channel.send({ embeds: [msgEmbed] });
                
            }
        });

    },

    async getLeaderBoardResults(serverId) {
        try {
            return await dbManager.getLeaderBoard(serverId);
        }
        catch (error) {
            console.log(`Enablement of SwearJar bot failed. Error: ${error}`)
            throw(`error`);
        }
    }
}