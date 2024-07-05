"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var minecraft_player_1 = require("minecraft-player");
var fs_1 = require("fs");
module.exports.wl.addToWL = function (username, uuid, dcid, message) {
    if (dcid == '')
        return;
    if (message == undefined)
        return;
    //load whitelist.json
    var whitelist = JSON.parse(fs_1.default.readFileSync(config.parsed.WHITELIST_PATH).toString());
    if (whitelist == undefined)
        return;
    //check if uuid / playername is already in whitelist
    if (whitelist.some(function (wl_line) { return wl_line.uuid === uuid; })) {
        message.react('❌');
        var entry = whitelist.find(function (wl_line) { return wl_line.uuid === uuid; });
        if (entry == undefined)
            return;
        message.reply((entry.name || "") +
            ' is already registered by <@' +
            entry.dcid +
            '>.');
        return -1;
    }
    if (whitelist.some(function (wl_line) { return wl_line.name === username; })) {
        message.react('❌');
        var other_entry = whitelist.find(function (wl_line) { return wl_line.name === username; });
        if (other_entry == undefined)
            return;
        message.reply(other_entry.name +
            ' is already registered by <@' +
            other_entry.dcid +
            '>.');
        return -1;
    }
    whitelist.push({ uuid: uuid, name: username, dcid: dcid });
    fs_1.default.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(whitelist));
    //reload whitelist on all servers
    message.react('✅');
    //TODO
};
module.exports.wl.remOfWL = function (username, uuid, dcid, message) {
    //load whitelist.json
    var whitelist = JSON.parse(fs_1.default.readFileSync(config.parsed.WHITELIST_PATH).toString());
    //check if player is already removed from whitelist
    if (!whitelist.some(function (player) { return player.name === username && player.dcid === dcid; })) {
        message.react('❌');
        var other_other_thing = whitelist.find(function (player) { return player.uuid === uuid; });
        if (other_other_thing == undefined)
            return;
        message.reply(other_other_thing.name +
            ' is registered by <@' +
            other_other_thing.dcid +
            '> thats not you.');
        return -1;
    }
    var newWhitelist = whitelist.filter(function (player) { return player.name !== username && player.dcid !== dcid; });
    fs_1.default.writeFileSync(config.parsed.WHITELIST_PATH, JSON.stringify(newWhitelist));
    //reload whitelist on all servers
    message.react('✅');
    //TODO
};
module.exports.wl.getplayersinwhitelist = function (discordid) {
    var registered_names = [];
    var file = fs_1.default.readFileSync(config.parsed.WHITELIST_PATH);
    var whitelist = JSON.parse(file.toString());
    // put all names in an array when the dcid is the same as the discordid
    whitelist.forEach(function (player) {
        if (player.dcid === discordid) {
            registered_names.push(player.name);
        }
    });
    return registered_names;
};
module.exports.wl.on_wl_relevant_message = function (message) {
    return __awaiter(this, void 0, void 0, function () {
        var playernames, uuid, found, uuid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!message.content.startsWith('register')) return [3 /*break*/, 2];
                    playernames = module.exports.wl.getplayersinwhitelist(message.author.id);
                    if (playernames.length > 2) {
                        message.reply('You are already registered as: ' + playernames.join(', '));
                        return [2 /*return*/];
                    }
                    if (message.content.split(' ')[1] === undefined) {
                        message.reply('Playername not found');
                        message.react('❌');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, minecraft_player_1.default)(message.content.split(' ')[1])];
                case 1:
                    uuid = (_a.sent()).uuid;
                    console.log(uuid);
                    //check if failed
                    if (!uuid || uuid === '069a79f4-44e9-4726-a5be-fca90e38aaf5' /*notch uuid*/) {
                        message.reply('Playername not found');
                        message.react('❌');
                        return [2 /*return*/];
                    }
                    found = module.exports.wl.addToWL(message.content.split(' ')[1], uuid, message.author.id, message);
                    if (found !== undefined)
                        if (typeof found === 'string') {
                            message.reply('You are already registered as ' + found);
                            message.react('❌');
                            return [2 /*return*/];
                        }
                        else if (found === -3) {
                            message.reply('This Player is already registered');
                            message.react('❌');
                            return [2 /*return*/];
                        }
                    _a.label = 2;
                case 2:
                    if (!message.content.startsWith('unregister')) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, minecraft_player_1.default)(message.content.split(' ')[1])];
                case 3:
                    uuid = (_a.sent()).uuid;
                    //check if failed
                    if (!uuid || uuid === '069a79f4-44e9-4726-a5be-fca90e38aaf5' /*notch uuid*/) {
                        message.reply('Player not found');
                        message.react('❌');
                    }
                    module.exports.wl.remOfWL(message.content.split(' ')[1], uuid, message.author.id, message);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.default = module.exports.wl;
