// require('dotenv').config();
const { Client, Intents, ClientVoiceManager, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const profanityChecker = require('./profanity-checker');
const { donation_links } = require('./server-data.json');
const { Console } = require("console");
const { link } = require("fs");

const messagesArray = [
   `Oops, #$@! Found. Would you like to donate to {serverName}'s SwearJar? <{link}>`,
   `Sensitive ears alert! How about a donation to {serverName}'s SwearJar? <{link}>`,
   `Toxins detected. Drop a $ to {serverName}'s SwearJar? <{link}>`,
   `Whoa Nelly, that's quite a mouth on you. Donate to {serverName}'s SwearJar? <{link}>`,

]

const usersDict = {};
dotenv.config();
const token = process.env.DISCORD_BOT_TOKEN;
const botDisabled = process.env.DISABLE_BOT === 'false' ? false : true;
console.log('Stating the Bot');
const client = new Client({
   intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});


client.on('ready', () => {
   console.log('Server is ready');
   console.log(`Bot disbabled: ${botDisabled}`);
})

client.on('interactionCreate', async interaction => {
   if (!interaction.isCommand()) return;

   const { commandName } = interaction;

   if (commandName === 'ping') {
      await interaction.reply('Pong!');
   }
});

client.on('messageCreate', (message) => {
   if (message.author.bot) return;
   const donationObj = getServerNameAndDonationLink(message, client);
   console.log(`*********Checking profanity on message '${message.content}', Server name: '${donationObj ? donationObj.serverName : 'not found'}'*******`);
   if (botDisabled === false) {
      profanityChecker.checkProfanityInText(message.content).then(res => {
         if (res) {
            const words = res.split(" ");
            const isProfnaityWord = words.find(word => word.indexOf("*") === 0 &&
               word.lastIndexOf("*") === word.length - 1);


            message.guild.members.fetch(message.author.id).then(member => {
               const userName = member.displayName ? member.displayName : message.author.username;
               const userData = checkIfUserReachedLimit(userName);

               if (isProfnaityWord && isProfnaityWord.length > 0) {
                  if (donationObj) {
                     if (Number(userData.count % donationObj.swear_limit) !== 0) {
                        message.reply(`${userName} swear #${userData.count}`);
                     } else {
                        console.log('swear found. placing swear jar link');
                        let randomMessage = messagesArray[Math.floor(Math.random() * messagesArray.length)];
                        randomMessage = replaceTokenInMessage(donationObj, randomMessage);
                        message.reply(`${userName} swear #${userData.count}\n${randomMessage}`);
                     }
                  } else {
                     // server not found  - show default message
                     message.reply(`${userName} swear #${userData.count}`);
                  }
               }
            })
         }
      });
   }
})

function checkIfUserReachedLimit(userName) {
   if (usersDict.hasOwnProperty(userName)) {
      const userData = usersDict[userName];
      userData.count++;
   } else {
      usersDict[userName] = { count: 1 };
   }
   return usersDict[userName];
}

function replaceTokenInMessage(donationObj, message) {
   const regex = /{[\w]*\}/g;
   let textTokens = message.match(regex);

   if (textTokens.length > 0 && textTokens.length === 2) {
      message = message.replace(textTokens[0], donationObj.serverName);
      message = message.replace(textTokens[1], donationObj.link);
   }
   return message;
}

function getServerNameAndDonationLink(message, client) {
   let donationLinkObj;
   const serverName = client.guilds.cache.get(message.guild.id).name;
   console.log(`**** server name is: ${serverName}`);
   if (serverName) {
      donationLinkObj = donation_links.find(x => x.serverName === serverName);
   }
   if (donationLinkObj) {
      return donationLinkObj;
   }
   return null;
}

client.login(token);