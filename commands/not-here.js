const dbManager = require('../db-manager');
const { Permissions } = require("discord.js");

module.exports = {
    info: {
        name: "not here"
    },
    runner(msg, bot) {
        this.disableSwearJar(msg, bot);
    },

    async disableSwearJar(msg, bot) {
        console.log(msg.member.permissions);
        if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const channelId = msg.channel.id;
            const channelName = msg.channel.name;
            try {
                const res = await dbManager.getDisabledChannels(msg.guildId);
                if (res && res.channelIds && res.channelIds.length > 0) {
                    const idx = res.channelIds.indexOf(channelId);
                    if (idx === -1) {
                        const result = await dbManager.setDisabledChannel(msg.guildId, channelId);
                        await msg.reply(`SwearJar bot is now disabled in the ${channelName} channel`);
                    } else {
                        await msg.reply(`SwearJar bot is already disabled in ${channelName} channel`);
                    }
                } else {
                    const result = await dbManager.setDisabledChannel(msg.guildId, channelId);
                    await msg.reply(`SwearJar bot is now disabled in the ${channelName} channel`);
                }             
            }
            catch (error) {
               console.log(`Disablement of SwearJar bot failed. Error: ${error}`)
               await msg.reply(`Disablement of SwearJar bot failed on ${channelName} channel`);
            }
         } else {
            await msg.reply(`You must be an admin to use this command`);
         }
    }
}