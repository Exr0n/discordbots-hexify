/* 

alot of content taken from https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3

*/

'use strict';

const conf = require('./app-config.json');

let m = {
  Discord: require("discord.js")
};

let client = new m.Discord.Client();


const handle = {
  "help": async (msg) => { /* todo */ },
  "ping": async (msg) => {
    const m = await msg.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    return m;
  },
  "invite": async (msg) => {
    return msg.channel.send(`Invite me to your server with ${conf.ux.invite}`);
  }
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} at ${Date()}`);
  
  client.user.setActivity(`for ${conf.ux.prefix}`, { type: 'WATCHING' });
});

client.on('message', async message => {
  if (message.author.bot) return; // ignore bots
  if (! message.content.startsWith(conf.ux.prefix)) return; // ignore things that don't start with our prefix
  
  const args = message.content.slice(conf.ux.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if (command in handle) {
    await handle[command](message, ...args);
  }
});

client.login(require("./#ignore/token.json")).catch(console.error);