// require('dotenv').config();
const { Client, Intents, ClientVoiceManager, MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const profanityChecker = require('./profanity-checker');
const { donation_links } = require('./server-data.json');
const { Console } = require("console");
const { link } = require("fs");
const dbManager = require('./db-manager');


dotenv.config();
const token = process.env.DISCORD_BOT_TOKEN;

const commands = [
   new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
   new SlashCommandBuilder().setName('sj-here').setDescription('Enables SwearJar bot on current channel'),
   new SlashCommandBuilder().setName('sj-not-here').setDescription('Disables SwearJar bot on current channel')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands("905551224282185789", "889952003868999760"), { body: commands })
   .then(() => console.log('Successfully registered application commands.'))
   .catch(`Error----> ${console.error}`);

const messagesArray = [
   `Oops, #$@! Found. Would you like to donate to {serverName}'s SwearJar? <{link}>`,
   `Sensitive ears alert! How about a donation to {serverName}'s SwearJar? <{link}>`,
   `Toxins detected. Drop a $ to {serverName}'s SwearJar? <{link}>`,
   `Whoa Nelly, that's quite a mouth on you. Donate to {serverName}'s SwearJar? <{link}>`,
]

const disabledChannels = {}; //dict key=>server, value=channel id array
const usersDict = {};
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
   const guilds = client.guilds.cache.map(guild => {
      return { id: guild.id, name: guild.name };
   });
   if (guilds.length > 0) {
      dbManager.addServersDetails(guilds).then((results) => {
         console.log(`Guilds added to known servers: ${JSON.stringify(guilds)}`);
      });
   }
})

client.on('interactionCreate', async interaction => {
   if (!interaction.isCommand()) return;

   const { commandName } = interaction;

   if (commandName === 'ping') {
      await interaction.reply('Pong!');
   }

   else if (commandName === 'sj-here') {
      if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
         const channelId = interaction.channel.id;
         const channelName = interaction.channel.name;
         try {
            const res = await dbManager.getDisabledChannels(interaction.guildId);
            if (res && res.channelIds && res.channelIds.length > 0) {
               // const result =  await dbManager.deleteDisabledChannel(interaction.guildId, channelId);
               const idx = res.channelIds.indexOf(channelId);
               res.channelIds.splice(idx, 1);
               const result = await dbManager.updateDisabledChannels(interaction.guildId, res.channelIds);
               await interaction.reply(`SwearJar bot is now enabled in the ${channelName} channel`);
            } else {
               await interaction.reply(`SwearJar bot enablement failed on ${channelName} channel`);
            }
         }
         catch (error) {
            console.log(`Enablement of SwearJar bot failed. Error: ${error}`)
            await interaction.reply(`Enablement of SwearJar bot failed on ${channelName} channel`);
         }
         // if(disabledChannels.hasOwnProperty(interaction.guildId)) {
         //    const index = disabledChannels[interaction.guildId].indexOf(channelId);
         //    if(index > -1){
         //       disabledChannels[interaction.guildId].splice(index, 1);
         //    }
         // }
         // await interaction.reply(`SwearJar bot is now enabled in the ${channelName} channel`);
      } else {
         await interaction.reply(`You must be an admin to use this command`);
      }
   }

   else if (commandName === 'sj-not-here') {
      if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
         const channelId = interaction.channel.id;
         const channelName = interaction.channel.name;
         // if (disabledChannels.hasOwnProperty(interaction.guildId)) {
         //    disabledChannels[interaction.guildId].push(channelId);
         // } else {
         //    disabledChannels[interaction.guildId] = [];
         //    disabledChannels[interaction.guildId].push(channelId);
         // }
         try {
            const result = await dbManager.setDisabledChannel(interaction.guildId, channelId);
            await interaction.reply(`SwearJar bot is now disabled in the ${channelName} channel`);
         }
         catch (error) {
            console.log(`Disablement of SwearJar bot failed. Error: ${error}`)
            await interaction.reply(`Disablement of SwearJar bot failed on ${channelName} channel`);
         }
      } else {
         await interaction.reply(`You must be an admin to use this command`);
      }
   }
});

/* Emitted whenever a guild is deleted/left.
*/
client.on("guildDelete", function (guild) {
   console.log(`the client deleted/left a guild`);
   // dbManager.deleteUser(user.id, guild.id)
});

client.on("guildBanAdd", function (ban) {
   console.log(`a member is banned from a guild`);
   dbManager.deleteUser(ban.user.id, ban.guild.id)
});


client.on('messageCreate', (message) => {
   if (message.author.bot) return;
   const wordsForCheck = message.content.replace(new RegExp(/(\*+)/, "g"), "");

   shouldDisable(message.guildId, message.channelId).then(shouldDisableBot => {
      if (!shouldDisableBot) {
         getServerNameAndDonationLink(message, client).then(serverInfoObj => {
            profanityChecker.checkProfanityInText(wordsForCheck).then(res => {
               if (res) {
                  const words = res.split(" ");
                  const isProfnaityWord = words.find(word => word.indexOf("*") === 0 &&
                     word.lastIndexOf("*") === word.length - 1);


                  message.guild.members.fetch(message.author.id).then(member => {
                     if (isProfnaityWord && isProfnaityWord.length > 0) {
                        const userName = member.displayName ? member.displayName : message.author.username;
                        getUserInfo(message.author.id, message.guildId).then(userData => {
                           if (serverInfoObj && serverInfoObj.donation_link) {
                              if (Number(userData.swearCount % serverInfoObj.swear_limit) !== 0) {
                                 message.reply(`${userName} swear #${userData.swearCount}`);
                              } else {
                                 console.log('swear found. placing swear jar link');
                                 let randomMessage = messagesArray[Math.floor(Math.random() * messagesArray.length)];
                                 randomMessage = replaceTokenInMessage(serverInfoObj, randomMessage);
                                 message.reply(`${userName} swear #${userData.swearCount}\n${randomMessage}`);
                              }
                           } else {
                              // server not found  - show default message
                              console.log('Server name and donation link not found')
                              message.reply(`${userName} swear #${userData.swearCount}`);
                           }
                        });
                     }
                  })
               }
            });
         });
      } else {
         console.log("Bot is disabled");
      }
   }).catch(error => {
      console.log(`Error occured in messageCreate ${error}`);
   })

})

const shouldDisable = async (serverId, channelId) => {
   if (botDisabled) {
      return true;
   } else {
      try {
         const disabledChannels = await dbManager.getDisabledChannels(serverId);
         if (disabledChannels && Object.keys(disabledChannels).length > 0 && disabledChannels.channelIds.indexOf(channelId) > -1) {
            return true;
         } else {
            return false;
         }
      }
      catch (error) {
         console.log('Getting disabled channels failed');
         return false;
      }
   }
}

async function getUserInfo(userId, serverId) {
   let user;
   user = await dbManager.getUser(userId);

   if (Object.keys(user).length === 0) {
      user = await dbManager.addUser(userId, serverId, 1);
   } else {
      user.swearCount = await dbManager.updateUser(userId);
   }
   return user;
}

function replaceTokenInMessage(donationObj, message) {
   const regex = /{[\w]*\}/g;
   let textTokens = message.match(regex);

   if (textTokens.length > 0 && textTokens.length === 2) {
      message = message.replace(textTokens[0], donationObj.server_name);
      message = message.replace(textTokens[1], donationObj.donation_link);
   }
   return message;
}

async function getServerNameAndDonationLink(message, client) {
   const serverId = message.guild.id;

   return await dbManager.getServerInfo(serverId).then(serverInfo => {
      if (serverInfo) {
         console.log(`**** getServerNameAndDonationLink -> found serverInfo object: ${JSON.stringify(serverInfo)}`);
         return serverInfo;
      }
      console.log(`**** getServerNameAndDonationLink -> server info object not found`);
      return null;
   })
}

client.login(token);