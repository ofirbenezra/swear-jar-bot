const { profile } = require("console");
const { MessageEmbed } = require("discord.js");
const dbManager = require('../db-manager');

module.exports = {
    info: {
        name: "profile"
    },
    runner(msg, bot) {
        const userName = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        this.getUserProfile(msg, bot).then(user => {
            if(user) {
                const msgEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .addField('SwearJar Profile', `${userName}\n\n` +
                    "\`Top swears:\`\n" + this.buildTopWearsTable(user.swears));
                msg.channel.send({ embeds: [msgEmbed] });
            }
        })
        
    },

    buildTopWearsTable(swears) {
        const sorted = Object.keys(swears).sort((a, b) => (swears[a] < swears[b]) ? 1 : -1);
        let table = '';
        sorted.forEach((element, index) => {
            if(index <= 4){
                let row = `${element}: ${swears[element]}`;
                row += "\n"
                table += row;
            }            
        });
        return table;
    },

    async getUserProfile(msg, bot) {
        const userName = msg.member.nickname ? msg.member.nickname : msg.member.username;
        // const userName = msg.member.user.username;
        const userId = msg.member.user.id;
        const serverId = msg.guildId
        try {
            return await dbManager.getUserProfile(serverId, userId);
        }
        catch (error) {
            console.log(`Getting user profile failed. Error: ${error}`)
            await msg.reply(`Getting user profile for user ${userName} failed`);
        }
    }
}