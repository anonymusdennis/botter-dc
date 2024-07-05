import minecraftPlayer from 'minecraft-player';
import fs from 'fs';
const wl = {
addToWL:  (username, uuid, dcid, message) => {
  if (dcid == '') return;
  if (message == undefined) return;
  //load whitelist.json
  const whitelist: Array<customWhitelistLine> = JSON.parse(fs.readFileSync(config.parsed.WHITELIST_PATH).toString());
  if (whitelist == undefined) return;
  //check if uuid / playername is already in whitelist
  if (whitelist.some((wl_line: customWhitelistLine) => wl_line.uuid === uuid)) {

    message.react('❌');
    const entry = whitelist.find((wl_line) => wl_line.uuid === uuid);
    if (entry == undefined) return;

    message.reply(
      (entry.name || "") +
      ' is already registered by <@' +
      entry.dcid +
      '>.',
    );
    return -1;
  }
  if (whitelist.some((wl_line) => wl_line.name === username)) {
    message.react('❌');
    const other_entry = whitelist.find((wl_line) => wl_line.name === username);
    if (other_entry == undefined) return;
    message.reply(
      other_entry.name +
      ' is already registered by <@' +
      other_entry.dcid +
      '>.',
    );
    return -1;
  }
  whitelist.push({ uuid, name: username, dcid });
  fs.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(whitelist));
  //reload whitelist on all servers
  message.react('✅');
  //TODO
},
remOfWL: function (username, uuid, dcid, message) {
  //load whitelist.json
  const whitelist : Array<customWhitelistLine> = JSON.parse(fs.readFileSync(config.parsed.WHITELIST_PATH).toString());
  //check if player is already removed from whitelist
  if (!whitelist.some((player) => player.name === username && player.dcid === dcid)) {
    message.react('❌');
    const other_other_thing = whitelist.find((player) => player.uuid === uuid);
    if (other_other_thing == undefined) return;
    message.reply(
      other_other_thing.name +
      ' is registered by <@' +
      other_other_thing.dcid +
      '> thats not you.',
    );
    return -1;
  }
  const newWhitelist = whitelist.filter((player) => player.name !== username && player.dcid !== dcid);
  fs.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(newWhitelist));
  //reload whitelist on all servers
  message.react('✅');
  //TODO
},

getplayersinwhitelist : function (discordid): Array<string> {
  const registered_names: Array<string> = [];
  const file = fs.readFileSync(config.parsed.WHITELIST_PATH);
  const whitelist: Array<customWhitelistLine> = JSON.parse(file.toString());
  // put all names in an array when the dcid is the same as the discordid
  whitelist.forEach((player) => {
    if (player.dcid === discordid) {
      registered_names.push(player.name);
    }
  });
  return registered_names;
},

on_wl_relevant_message : async function (message) {
  if (message.content.startsWith('register')) {
    const playernames = module.exports.wl.getplayersinwhitelist(message.author.id);
    if (playernames.length > 2) {
      message.reply('You are already registered as: ' + playernames.join(', '));
      return;
    }
    if (message.content.split(' ')[1] === undefined) {
      message.reply('Playername not found');
      message.react('❌');
      return;
    }
    const { uuid } = await minecraftPlayer(message.content.split(' ')[1]);
    console.log(uuid);
    //check if failed
    if (!uuid || uuid === '069a79f4-44e9-4726-a5be-fca90e38aaf5' /*notch uuid*/) {
      message.reply('Playername not found');
      message.react('❌');
      return;
    }
    const found = module.exports.wl.addToWL(message.content.split(' ')[1], uuid, message.author.id, message);
    if (found !== undefined)
      if (typeof found === 'string') {
        
        message.reply('You are already registered as ' + found);
        message.react('❌');
        return;
      } else if (found === -3) {
        message.reply('This Player is already registered');
        message.react('❌');
        return;
      }
    //react with a checkmark
  }
  if (message.content.startsWith('unregister')) {
    //check if username is a real player
    const { uuid } = await minecraftPlayer(message.content.split(' ')[1]);
    //check if failed
    if (!uuid || uuid === '069a79f4-44e9-4726-a5be-fca90e38aaf5' /*notch uuid*/) {
      message.reply('Player not found');
      message.react('❌');
    }
    module.exports.wl.remOfWL(message.content.split(' ')[1], uuid, message.author.id, message);
  }
},
}
export default wl;