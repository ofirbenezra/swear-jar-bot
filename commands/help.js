const { MessageEmbed } = require("discord.js");

const inviteMeLink = 'https://discord.com/api/oauth2/authorize?client_id=890247030507704330&permissions=0&scope=bot%20applications.commands';
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
            .setDescription(`This bot reacts to swears in your server and counts them up for individual users.\n
                             Use the prefix sj followed by the command name!\n
                             sj-not-here - will disable the bot in a specific channel
                             sj-here - will enable the bot in a specific channel\n
                             [Invite Me](${inviteMeLink}) | [Support Server](${supportServerLink}) | [Vote for us!](${voteForUsLink})`)
            .setThumbnail('https://i.imgur.com/6AWSGk0.png')
            // .addFields(
            //     { name: 'Regular field title', value: 'Some value here' },
            //     { name: '\u200B', value: '\u200B' },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            // )
            // .addField('Inline field title', 'Some value here', true)
            // .setImage('https://imgur.com/6AWSGk0')
            // .setTimestamp()
        // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
        msg.channel.send({ embeds: [msgEmbed] });
    }
}