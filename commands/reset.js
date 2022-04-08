const dbManager = require('../db-manager');
const { Permissions } = require("discord.js");

module.exports = {
    info: {
        name: "reset"
    },
    runner(msg, bot) {
        this.resetSwears(msg, bot);
    },

    async resetSwears(msg, bot) {
        const userName = msg.member.nickname !== null ? msg.member.nickname : msg.member.user.username;
        const userId = msg.member.user.id;
        const serverId = msg.guildId
        try {
            const res = await dbManager.resetUserSwears(serverId, userId);
            if (res) {
                await msg.reply(`Swear count was reset for ${userName}`);

            } else {
                await msg.reply(`SwearJar count reset has failed for ${userName}`);
            }
        }
        catch (error) {
            console.log(`SwearJar count reset has failed. Error: ${error}`)
            await msg.reply(`SwearJar count reset has failed`);
        }
    }
}