const { Client, Intents, ClientVoiceManager, MessageEmbed, Permissions } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const profanityChecker = require('./profanity-checker');
const { donation_links } = require('./server-data.json');
const { Console } = require("console");
const fs = require('fs');
const path = require('path');
const dbManager = require('./db-manager');
const config = require('./config.json');


dotenv.config();
const token = process.env.DISCORD_BOT_TOKEN;

let commands = new Map();

fs.readdirSync(path.join(__dirname, 'commands')).forEach((f) => {
   if (f.endsWith(".js")) {
      let file = require(path.join(__dirname, 'commands', f));
      commands.set(file.info.name, file);
      console.log(`Registered command: ${file.info.name}`);
   }
});
// const commands = [
//    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
//    new SlashCommandBuilder().setName('sj-here').setDescription('Enables SwearJar bot on current channel'),
//    // new SlashCommandBuilder().setName('sj-not-here').setDescription('Disables SwearJar bot on current channel')
// ].map(command => command.toJSON());

// const rest = new REST({ version: '9' }).setToken(token);
// rest.put(Routes.applicationCommands("890247030507704330"), { body: commands })
// .then(() => console.log(`Successfully registered application commands on guild`))
// .catch(`Error occured while registering slash commands----> ${console.error}`);

// rest.get(Routes.applicationGuildCommands("890247030507704330", "889952003868999760"))
// .then((res) => console.log(res))
// .catch(`Error occured while registering slash commands----> ${console.error}`);


const messagesArray = [
   `Oops, #$@! Found. Would you like to donate to {serverName}'s SwearJar? <{link}>`,
   `Sensitive ears alert! How about a donation to {serverName}'s SwearJar? <{link}>`,
   `Toxins detected. Drop a $ to {serverName}'s SwearJar? <{link}>`,
   `Whoa Nelly, that's quite a mouth on you. Donate to {serverName}'s SwearJar? <{link}>`,
]

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
      // guilds.forEach(guild => {

      // })
      dbManager.addServersDetails(guilds).then((results) => {
         console.log(`Guilds added to known servers: ${JSON.stringify(guilds)}`);
      });
   }
})

client.on('interactionCreate', async interaction => {
   if (!interaction.isCommand()) return;

   const { commandName } = interaction;
   console.log(`***** interactionCreate --> command name: ${commandName}`);

   if (commandName === 'ping') {
      await interaction.reply('Pong!');
   }
});

/* Emitted whenever a guild is deleted/left.
*/
client.on("guildDelete", function (guild) {
   console.log(`the client deleted/left a guild`);
   dbManager.deleteUser(guild.id)
});

client.on("guildBanAdd", function (ban) {
   console.log(`a member is banned from a guild`);
   dbManager.deleteUser(ban.user.id, ban.guild.id)
});


client.on('messageCreate', (message) => {
   if (message.author.bot) return;

   try {
      executeSjCommands(message);
      const wordsForCheck = message.content.replace(new RegExp(/(\*+)/, "g"), "");

      shouldDisable(message.guildId, message.channelId).then(shouldDisableBot => {
         if (!shouldDisableBot) {
            getServerNameAndDonationLink(message, client).then(serverInfoObj => {
               const swearArr = profanityChecker.checkProfanityInText(wordsForCheck);
               if (swearArr.length > 0) {
                  const words = wordsForCheck.trim().split(" ");
                  // const isProfnaityWord = words.find(word => word.indexOf("*") === 0 &&
                  //    word.lastIndexOf("*") === word.length - 1);

                  const swearsDic = {};
                  words.forEach((w, index) => {
                     const word = w.toLowerCase();
                     if (word !== '' && swearArr.includes(word)) {
                        if (swearsDic.hasOwnProperty(word)) {
                           swearsDic[wordw]++;
                        } else {
                           swearsDic[word] = 1;
                        }
                     }
                  })

                  message.guild.members.fetch(message.author.id).then(member => {
                     // if (isProfnaityWord && isProfnaityWord.length > 0) {
                     const userName = member.displayName ? member.displayName : message.author.username;
                     getUserInfo(message.author.id, message.guildId, userName, swearsDic).then(userData => {
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
                     // }
                  })
               }
            });
         } else {
            console.log("Bot is disabled");
         }
      }).catch(error => {
         console.log(`Error occured in messageCreate ${error}`);
      })
   }
   catch (error) {
      console.log(`Error occured in messageCreate ${error}`);
   }

})

const executeSjCommands = (message) => {
   if (message.content.toLowerCase().startsWith(config.prefix)) {
      const commandParts = message.content.split(" ");
      let command;
      if (commandParts.length === 2) {
         command = commandParts[1];
      } else if (commandParts.length === 3) {
         command = `${commandParts[1]} ${commandParts[2]}`
      }
      if (commands.has(command)) {
         let cmd = commands.get(command)
         if (typeof cmd.runner === "function") {
            cmd.runner(message, client);
         }         
      }
      return;
   }
}

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

async function getUserInfo(userId, serverId, userName, swearsDic) {
   let user;
   user = await dbManager.getUser(serverId, userId);

   if (Object.keys(user).length === 0) {
      user = await dbManager.addUser(userId, serverId, userName, 1, swearsDic);
   } else {
      user.swearCount = await dbManager.updateUser(user, userName, swearsDic);
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