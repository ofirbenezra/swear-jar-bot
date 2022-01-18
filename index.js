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
const dbManager = require('./db-manager');

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
   intents: [
      Intents.FLAGS.GUILDS, 
      Intents.FLAGS.GUILD_MESSAGES, 
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      // Intents.FLAGS.GUILD_MEMBERS,
      // Intents.FLAGS.GUILD_BANS
   ],
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

/* Emitted whenever a guild is deleted/left.
*/
client.on("guildDelete", function (guild) {
   console.log(`the client deleted/left a guild`);
   // dbManager.deleteUser(user.id, guild.id)
});

client.on("guildBanAdd", function(ban){
   console.log(`a member is banned from a guild`);
   dbManager.deleteUser(ban.user.id, ban.guild.id)
});


client.on('messageCreate', (message) => {
   if (message.author.bot) return;
   const donationObj = getServerNameAndDonationLink(message, client);
   const wordsForCheck = message.content.replace(new RegExp(/(\*+)/, "g"), "");
   console.log(`*********Checking profanity on message '${message.content}', Server name: '${donationObj ? donationObj.serverName : 'not found'}'*******`);
   if (botDisabled === false) {
      profanityChecker.checkProfanityInText(wordsForCheck).then(res => {
         if (res) {
            const words = res.split(" ");
            const isProfnaityWord = words.find(word => word.indexOf("*") === 0 &&
               word.lastIndexOf("*") === word.length - 1);


            message.guild.members.fetch(message.author.id).then(member => {
               if (isProfnaityWord && isProfnaityWord.length > 0) {
                  const userName = member.displayName ? member.displayName : message.author.username;
                  getUserInfo(message.author.id, message.guildId).then(userData => {
                     if (donationObj) {
                        if (Number(userData.swearCount % donationObj.swear_limit) !== 0) {
                           message.reply(`${userName} swear #${userData.swearCount}`);
                        } else {
                           console.log('swear found. placing swear jar link');
                           let randomMessage = messagesArray[Math.floor(Math.random() * messagesArray.length)];
                           randomMessage = replaceTokenInMessage(donationObj, randomMessage);
                           message.reply(`${userName} swear #${userData.swearCount}\n${randomMessage}`);
                        }
                     } else {
                        // server not found  - show default message
                        message.reply(`${userName} swear #${userData.swearCount}`);
                     }
                  });
               }
            })
         }
      });
   }
})

async function getUserInfo(userId, serverId) {
   let user;
   user = await dbManager.getUser(userId);

   if (Object.keys(user).length === 0) {
      user = await dbManager.addUser(userId, serverId, 1);
   } else {
      user.swearCount =  await dbManager.updateUser(userId);
   }
   return user;
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
   console.log(`**** getServerNameAndDonationLink -> server name is: ${serverName} message is:${message}`);
   if (serverName) {
      donationLinkObj = donation_links.find(x => x.serverName.indexOf(serverName) > 0);
   }
   if (donationLinkObj) {
      console.log(`**** getServerNameAndDonationLink -> found donation object: ${JSON.stringify(donationLinkObj)}`);
      return donationLinkObj;
   }
   return null;
}

client.login(token);