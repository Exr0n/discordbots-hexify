/* 

alot of content taken from https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3
todo: role position: it doesn't go to the top??

*/

'use strict';

const conf = require('./app-config.json');

let m = {
  Discord: require("discord.js")
};

let client = new m.Discord.Client();
const talkedRecently = new Set();

const handle = {
  "help": {
    desc: "Displays this message",
    run: async (msg) => {
      let cmdlist = "";
      for (k of handle) {
        cmdlist += `${k.padEnd(20)}${handle[k].desc}\n`;
      }
      return msg.reply(`Try \`${conf.ux.prefix}set <hexcode>\` to change your role color!\n${cmdlist}`)
      .catch(console.error);
    }
  },
  "ping": {
    run: async (msg) => {
      const m = await msg.channel.send("Ping?");
      m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
      return m;
    },
    desc: "Ping the bot"
  },
  "invite": {
    desc: "Get invite link for the bot",
    run: async (msg) => {
    return msg.channel.send(`Invite me to your server with ${conf.ux.invite}`);
    }
  },
  "set": {
    desc: "Set hex color: usage set <6-digit-hex>",
    run: async (msg, hex) => {
      if (msg.guild === undefined) return msg.reply(`Must be in guild!`);
      
      if (hex.startsWith('#')) hex = hex.substr(1);
      if (hex === "000000") hex = "010101";
      
      let torem = msg.member.roles.find(r => /^hexify\-[0-9A-F]{6}$/i.test(r.name));
      if (torem !== null) {
        msg.member.removeRole(torem)
        .then(() => {
          if (torem.members.size === 0) { // empty
            return torem.delete();
          }
        })
        .catch(() => msg.reply("Unable to remove previous color!"))
        .catch(console.error);
      }
      
      if (/^[0-9A-F]{6}$/i.test(hex)) {
        let toadd = msg.guild.roles.find(r => r.name === conf.fn.role_prefix + hex);
        if (toadd === null) {
          toadd = await msg.guild.createRole({
            name: conf.fn.role_prefix + hex,
            color: "#" + hex,
            position: 1000
          })
          .catch(() => msg.reply(`Unable to create new role!`))
          .catch(console.error);
        }
        
        console.log(`${Date()} adding role ${toadd.name} to ${msg.author.tag}`);
        
        return msg.member.addRole(toadd)
        .then(
          () => msg.reply(`Your role color was set to #${hex}!`)
          .catch(console.error),
          () => msg.reply(`Unable to add role!`)
          .catch(console.error)
        );
      } else {
        return msg.reply(`Invalid hex code!`)
        .catch(console.error);
      }
    }
  }
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} at ${Date()}`);
  
  client.user.setActivity(`for ${conf.ux.prefix}help`, { type: 'WATCHING' });
});

client.on('message', async message => {
  if (message.author.bot) return; // ignore bots
  if (! message.content.startsWith(conf.ux.prefix)) return; // ignore things that don't start with our prefix
  
  if (talkedRecently.has(message.author.id)) { // set message cooldown
    return message.reply("Please wait before trying again!");
  }
  talkedRecently.add(message.author.id);
  setTimeout(() => {
    talkedRecently.delete(message.author.id);
  }, conf.ux.cooldown);
    
  const args = message.content.slice(conf.ux.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if (command in handle) {
    return handle[command].run(message, ...args)
      .catch(() => message.reply("Something went wrong!"))
      .catch(console.error);
  } else {
    return message.reply(`Unkown command! Try \`${conf.ux.prefix}help..\`.`)
      .catch(console.error);
  }
  
});

client.login(require("./#ignore/token.json")).catch(console.error);