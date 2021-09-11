// require('dotenv').config();
const { Client, Intents, ClientVoiceManager } = require("discord.js");
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
   // List servers the bot is connected to
   console.log("Servers:")
   client.guilds.cache.forEach((guild) => {
      console.log(" - " + guild.name + '' + guild.id)


      // List all channels
      guild.channels.cache.forEach((channel) => {
         console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
      })
   })
   // const Guilds = client.guilds.cache.map(guild => guild.id);
   //  console.log(Guilds);
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	}
});

client.on('messageCreate', (message) => {
   profanityChecker.checkProfanityInText(message.content).then(res => {
      if(res.indexOf('*') > -1){
         console.log('swear found. placing swear jar link');
         message.reply('Profanity found. Please donate in here: https://streamelements.com/machitv/tip');
      }
   });
})

console.log('before login');
client.login(token);