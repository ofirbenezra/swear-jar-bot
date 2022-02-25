const { MessageEmbed } = require("discord.js");

const inviteMeLink = 'https://discord.com/api/oauth2/authorize?client_id=890247030507704330&permissions=0&scope=bot';
const supportServerLink = 'https://discord.gg/5UKqGBM5';
const voteForUsLink = 'https://top.gg/bot/890247030507704330';

module.exports = {
    info: {
        name: "help"
    },
    runner(msg, bot) {

        const msgEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('SwearJar Bot Help')
            .addField(`This bot reacts to swears in your server and counts them up for individual users.`,
                             "Use the prefix \`sj\` followed by the command name!\n\n" +                             
                             "\`sj\` not here - will disable the bot in a specific channel\n" +
                             "\`sj\` here - will enable the bot in a specific channel\n\n" +                             
                             `[Invite Me](${inviteMeLink}) | [Support Server](${supportServerLink}) | [Vote for us!](${voteForUsLink})`);        
        msg.channel.send({ embeds: [msgEmbed] });
    }
}