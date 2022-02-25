const dbManager = require('../db-manager');
const { Permissions } = require("discord.js");

module.exports = {
    info: {
        name: "here"
    },
    runner(msg, bot) {
        this.enableSwearJar(msg, bot);
    },

    async enableSwearJar(msg, bot) {
        if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const channelId = msg.channel.id;
            const channelName = msg.channel.name;
            try {
                const res = await dbManager.getDisabledChannels(msg.guildId);
                if (res && res.channelIds && res.channelIds.length > 0) {
                    const idx = res.channelIds.indexOf(channelId);
                    if(idx > -1){
                        res.channelIds.splice(idx, 1);
                        const result = await dbManager.updateDisabledChannels(msg.guildId, res.channelIds);
                        await msg.reply(`SwearJar bot is now enabled in the ${channelName} channel`);
                    } else {
                        await msg.reply(`${channelName} channel was not found in disabled channels`);
                    }
                    
                } else {
                    await msg.reply(`SwearJar bot is already enabled in ${channelName} channel`);
                }
            }
            catch (error) {
                console.log(`Enablement of SwearJar bot failed. Error: ${error}`)
                await msg.reply(`Enablement of SwearJar bot failed on ${channelName} channel`);
            }
        } else {
            await msg.reply(`You must be an admin to use this command`);
        }
    }
}