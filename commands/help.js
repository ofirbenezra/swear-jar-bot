const { MessageEmbed } = require("discord.js");

const inviteMeLink = 'https://discord.com/api/oauth2/authorize?client_id=890247030507704330&permissions=0&scope=bot';
const supportServerLink = 'https://discord.gg/cDPJyHmxGA';
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
                             "\`sj\` profile - displays user profile\n" +
                             "\`sj\` lead - displays leaderboard\n" +                            
                             "\`sj\` not here - disables the bot in a specific channel\n" +
                             "\`sj\` here - enables the bot in a specific channel\n" +       
                             "\`sj\` reset - will reset the count for user\n\n" +                        
                             `[Invite Me](${inviteMeLink}) | [Support Server](${supportServerLink}) | [Vote for us!](${voteForUsLink})`);        
        msg.channel.send({ embeds: [msgEmbed] });
    }
}