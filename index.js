// require('dotenv').config();
const { Client, Intents, ClientVoiceManager, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const profanityChecker = require('./profanity-checker');

dotenv.config();
const token = process.env.DISCORD_BOT_TOKEN;
console.log('Stating the Bot');
const client = new Client({
   intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});


client.on('ready', () => {
   console.log('Server is ready');
})

client.on('interactionCreate', async interaction => {
   if (!interaction.isCommand()) return;

   const { commandName } = interaction;

   if (commandName === 'ping') {
      await interaction.reply('Pong!');
   }
});

client.on('messageCreate', (message) => {
   const botDisabled = process.env.DISABLE_BOT === 'false' ? false : true;
   console.log(`Bot disbabled: ${botDisabled}`);
   if (botDisabled === false) {
      profanityChecker.checkProfanityInText(message.content).then(res => {
         if (res && res.indexOf('*') > -1) {
            console.log('swear found. placing swear jar link');
            message.reply(`Oops, #$@! Found. Would you like to donate to machitv's SwearJar? Click here: https://streamelements.com/machitv/tip`);
         }
      });
   }
})

client.login(token);