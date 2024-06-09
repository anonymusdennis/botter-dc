const minecraftPlayer = require("minecraft-player");
const fs = require('fs');

(function () {
    const config = require('dotenv').config()
    module.exports.addToWL = function (username, uuid, dcid, message) {
        if (dcid == '') return;
        //load whitelist.json
        const whitelist = JSON.parse(fs.readFileSync(config.parsed.WHITELIST_PATH));
        //check if uuid / plname is already in whitelist
        if (whitelist.some(player => player.uuid === uuid)) {
            message.react('❌');
            message.reply(whitelist.find(player => player.uuid === uuid).name +
                ' is already registered by <@' + whitelist.find(player => player.uuid === uuid).dcid + '>.');
            return -1;
        }
        if (whitelist.some(player => player.name === username)) {
            message.react('❌');
            message.reply(whitelist.find(player => player.name === username).name +
                ' is already registered by <@' + whitelist.find(player => player.name === username).dcid + '>.');
            return -1;
        }
        whitelist.push({ uuid, name: username, dcid });
        fs.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(whitelist));
        //reload whitelist on all servers
        message.react('✅');
        //TODO

    }
    module.exports.remOfWL = function (username, uuid, dcid, message) {
        //load whitelist.json
        const whitelist = JSON.parse(fs.readFileSync(config.parsed.WHITELIST_PATH));
        //check if player is already removed from whitelist
        if (!whitelist.some(player => player.name === username && player.dcid === dcid)) {
            message.react('❌');
            message.reply(whitelist.find(player => player.uuid === uuid).name +
                ' is registered by <@' + whitelist.find(player => player.uuid === uuid).dcid + '> thats not you.');
            return -1;
        }
        const newWhitelist = whitelist.filter(player => player.name !== username && player.dcid !== dcid);
        fs.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(newWhitelist));
        //reload whitelist on all servers
        message.react('✅');
        //TODO

    }


    module.exports.getplayersinwhitelist = function (discordid) {
        const registered_names = [];
        let file = fs.readFileSync(config.parsed.WHITELIST_PATH)
        const whitelist = JSON.parse(file);
        // put all names in an array when the dcid is the same as the discordid
        whitelist.forEach(player => {
            if (player.dcid === discordid) {
                registered_names.push(player.name);
            }
        });
        return registered_names;

    }

    module.exports.on_wl_relevant_message = async function (message) {
        if (message.content.startsWith('register')) {
            let playernames = module.exports.getplayersinwhitelist(message.author.id);
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
            let iffound = module.exports.addToWL(message.content.split(' ')[1], uuid, message.author.id, message);
            if (iffound !== undefined)
                if (typeof iffound === 'string') {
                    message.reply('You are already registered as ' + iffound);
                    message.react('❌');
                    return;
                }
                else if (iffound === -3) {
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
            module.exports.remOfWL(message.content.split(' ')[1], uuid, message.author.id, message);

        }
    }
}());