var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import minecraftPlayer from 'minecraft-player';
import fs from 'fs';
const wl = {
    addToWL: (username, uuid, dcid, message) => {
        if (dcid == '')
            return;
        if (message == undefined)
            return;
        //load whitelist.json
        const whitelist = JSON.parse(fs.readFileSync(config.parsed.WHITELIST_PATH).toString());
        if (whitelist == undefined)
            return;
        //check if uuid / playername is already in whitelist
        if (whitelist.some((wl_line) => wl_line.uuid === uuid)) {
            message.react('❌');
            const entry = whitelist.find((wl_line) => wl_line.uuid === uuid);
            if (entry == undefined)
                return;
            message.reply((entry.name || "") +
                ' is already registered by <@' +
                entry.dcid +
                '>.').then((replyer) => {
                setTimeout(() => { replyer.delete(); }, 1000 * 60);
            });
            return -1;
        }
        if (whitelist.some((wl_line) => wl_line.name === username)) {
            message.react('❌');
            const other_entry = whitelist.find((wl_line) => wl_line.name === username);
            if (other_entry == undefined)
                return;
            message.reply(other_entry.name +
                ' is already registered by <@' +
                other_entry.dcid +
                '>.').then((replyer) => {
                setTimeout(() => { replyer.delete(); }, 1000 * 60);
            });
            return -1;
        }
        whitelist.push({ uuid, name: username, dcid });
        fs.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(whitelist, null, 4));
        //reload whitelist on all servers
        message.react('✅');
        //TODO
    },
    remOfWL: function (username, uuid, dcid, message) {
        //load whitelist.json
        const whitelist = JSON.parse(fs.readFileSync(config.parsed.WHITELIST_PATH).toString());
        //check if player is already removed from whitelist
        if (!whitelist.some((player) => player.name === username && player.dcid === dcid)) {
            message.react('❌');
            const registered_by = whitelist.find((player) => player.uuid === uuid);
            if (registered_by == undefined)
                return;
            message.reply(registered_by.name +
                ' ist registriert von <@' +
                registered_by.dcid +
                '> , was nicht du bist.').then((replyer) => {
                setTimeout(() => { replyer.delete(); }, 1000 * 60);
            });
            return -1;
        }
        const newWhitelist = whitelist.filter((player) => player.name !== username && player.dcid !== dcid);
        fs.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(newWhitelist, null, 4));
        //reload whitelist on all servers
        message.react('✅');
        //TODO
    },
    getplayersinwhitelist: function (discordid) {
        const registered_names = [];
        const file = fs.readFileSync(config.parsed.WHITELIST_PATH);
        const whitelist = JSON.parse(file.toString());
        // put all names in an array when the dcid is the same as the discordid
        whitelist.forEach((player) => {
            if (player.dcid === discordid) {
                registered_names.push(player.name);
            }
        });
        return registered_names;
    },
    on_wl_relevant_message: function (message) {
        return __awaiter(this, void 0, void 0, function* () {
            let replyer;
            if (message.content.startsWith('mylist')) {
                setTimeout(() => { message.delete(); }, 1000 * 60);
                const playernames = wl.getplayersinwhitelist(message.author.id);
                if (playernames.length > 0) {
                    replyer = yield message.reply("Du has registriert: " + playernames.join(', '));
                    message.react('✅');
                }
                else {
                    replyer = yield message.reply("Noch nichts registriert");
                    message.react('✅');
                }
                setTimeout(() => { replyer.delete(); }, 1000 * 60);
                return;
            }
            if (message.content.startsWith('register')) {
                setTimeout(() => { message.delete(); }, 1000 * 60);
                const playernames = wl.getplayersinwhitelist(message.author.id);
                if (playernames.length > Number.parseInt(globalThis.config.parsed.PLAYER_CAP)) {
                    replyer = yield message.reply('Du bist bereits als ' + playernames.join(', ')
                        + " Registriert, nutze unregister um das zu entfernen (es gibt eine Cap von "
                        + globalThis.config.parsed.PLAYER_CAP + " Spielern)");
                    setTimeout(() => { replyer.delete(); }, 1000 * 60);
                    return;
                }
                if (message.content.split(' ')[1] === undefined) {
                    replyer = yield message.reply('Spielername nicht gefunden');
                    message.react('❌');
                    setTimeout(() => { replyer.delete(); }, 1000 * 60);
                    return;
                }
                const { uuid } = yield minecraftPlayer(message.content.split(' ')[1]);
                console.log(uuid);
                //check if failed
                if (!uuid || uuid === '069a79f4-44e9-4726-a5be-fca90e38aaf5' /*notch uuid*/) {
                    replyer = yield message.reply('Spielername nicht gefunden');
                    message.react('❌');
                    setTimeout(() => { replyer.delete(); }, 1000 * 60);
                    return;
                }
                const found = wl.addToWL(message.content.split(' ')[1], uuid, message.author.id, message);
                if (found !== undefined)
                    if (typeof found === 'string') {
                        replyer = yield message.reply('Bereits registriert als ' + found + ' nutze unregister um das zu entfernen');
                        message.react('❌');
                        setTimeout(() => { replyer.delete(); }, 1000 * 60);
                        return;
                    }
                    else if (found === -3) {
                        replyer = yield message.reply('Dieser Spieler ist bereits gewhitelistet');
                        message.react('❌');
                        setTimeout(() => { replyer.delete(); }, 1000 * 60);
                        return;
                    }
                //react with a checkmark
            }
            if (message.content.startsWith('unregister')) {
                setTimeout(() => { message.delete(); }, 1000 * 60);
                //check if username is a real player
                const { uuid } = yield minecraftPlayer(message.content.split(' ')[1]);
                //check if failed
                if (!uuid || uuid === '069a79f4-44e9-4726-a5be-fca90e38aaf5' /*notch uuid*/) {
                    replyer = yield message.reply('Spieler nicht gefunden');
                    setTimeout(() => { replyer.delete(); }, 1000 * 60);
                    message.react('❌');
                }
                wl.remOfWL(message.content.split(' ')[1], uuid, message.author.id, message);
            }
        });
    },
};
export default wl;
