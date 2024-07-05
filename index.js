"use strict";
//plan: remove player from the whitelist.
//example whitelist.json file:
/*
[
  {
    "uuid": "9af99b2b-a3bb-4a7c-99a7-d119704fa4ef",
    "name": "aaaaa"
  }
]*/
//goal
//the file /srv/mc_whitelist/whitelist.json is shared between all servers and only we have access to it.
//add all registered players to the whitelist.json file.
//after reload the whitelist on all servers using the pterodactyl api. with /whitelist reload
//the same when removing players from the whitelist.
// all this will integrate via discordjs ONLY ON ONE DC SERVER.
//commands: register
//plan: add player to the whitelist.
//commands: unregister 015c5a30-a553-4163-9fc3-f47bb4e71f88
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
var discord_js_1 = require("discord.js");
var dotenv_1 = require("dotenv");
var nodeactyl_1 = require("nodeactyl");
var whiteliststuff_js_1 = require("./whiteliststuff.js");
var dc_channel_updater_js_1 = require("./dc_channel_updater.js");
globalThis.config = dotenv_1.default.config();
var server_uuid_blacklist = [];
if (config == undefined || typeof (config) != "object" || config.parsed == undefined || typeof (config) != "object") {
    console.log("Malformed .env File, please fix");
    process.exit();
}
console.log(config);
var client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildModeration,
        //create channels
        discord_js_1.GatewayIntentBits.GuildMessageTyping,
        discord_js_1.GatewayIntentBits.GuildWebhooks,
    ],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction],
});
var token = config.parsed.TOKEN;
var application = new nodeactyl_1.default.NodeactylApplication('https://moddedmc.de', config.parsed.TOKEN_PTERO_APPL);
var pteroclient = new nodeactyl_1.default.NodeactylClient('https://moddedmc.de', config.parsed.TOKEN_PTERO_CLIENT);
client.once('ready', function () {
    console.log('Ready!');
    dc_channel_updater_js_1.default.init(client, application, pteroclient);
});
// Application
//commands
client.on('messageCreate', function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!message.inGuild() || message.guildId != ((_a = config.parsed) === null || _a === void 0 ? void 0 : _a.GUILD_ID))
                    return [2 /*return*/];
                return [4 /*yield*/, whiteliststuff_js_1.default.on_wl_relevant_message(message)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
var commandlist = [
    'say §4[!!!WICHTIG!!!]',
    'say Nach längerem Überlegen, und vielen verlorenen Spielern haben wir(das Serverteam) uns nun entschieden:',
    'say Um auf moddedmc.de / mmc.rip zu spielen, müssen sich bald alle Spieler auf dem gleichen DC Server registrieren',
    'say Dies soll bewirken, dass endlich unsere Community wieder zusammenkommt.',
    'say das Ganze wird auf whitelist basis ablaufen und nach Registrierung, werden alle Spieler global auf den gehosteten Servern AUTOMATISCH der whitelistet hinzugefügt.',
    'say Die Server werden weiterhin bis in alle Ewigkeit kostenlos bleiben, dies ist nur eine Maßnahme zum Wiederbeleben aller Modpack/events.',
    'say Um dich später der whitelist hinzuzufügen, einfach dem Server über den untenstehenden Link beitreten',
    'tellraw @a {"text":"DC Server","clickEvent":{"action":"open_url","value":"https://discord.gg/mjA8PfAhea"},"hoverEvent":{"action":"show_text","value":[{"text":"Dem DC server beitreten","bold":true,"color":"dark_blue"}]}}',
    'say und wo der link oben nicht gezeigt wird, hier nochmal: https://discord.gg/mjA8PfAhea',
    'say Danke für euer Verständnis, diese Änderungen werden erst nach einem Monat aktiviert, sodass jeder Zeit bleibt sich zu registrieren.',
];
function spammessage_forall() {
    var _this = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    application.getAllServers().then(function (servers) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            servers.data.forEach(function (server) { return __awaiter(_this, void 0, void 0, function () {
                var commanded, success_1, timeout_1;
                var _this = this;
                return __generator(this, function (_a) {
                    //console.log(JSON.stringify(server));
                    if (server_uuid_blacklist.includes(server.attributes.uuid)) {
                        return [2 /*return*/];
                    }
                    if (server.attributes.uuid == '015c5a30-a553-4163-9fc3-f47bb4e71f88') {
                        commanded = [];
                        success_1 = true;
                        timeout_1 = 0;
                        commandlist.forEach(function (command) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                timeout_1 += 1000;
                                try {
                                    setTimeout(pteroclient.sendServerCommand.bind(pteroclient, server.attributes.uuid, command), timeout_1);
                                }
                                catch (e) {
                                    success_1 = false;
                                    //exit loop
                                    return [2 /*return*/];
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        if (success_1)
                            commanded.push(server);
                    }
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
}
//sendcommandtoallservers();
client.login(token);
function minutely_update() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, application.getAllServers().then(function (servers) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            dc_channel_updater_js_1.default.minutely_update(servers);
                            return [2 /*return*/];
                        });
                    }); })
                    //all things that need to be updated every minute
                ];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
spammessage_forall();
setInterval(spammessage_forall, 1000 * 20); // 1 hour
setInterval(minutely_update, 1000 * 60); // 60 seconds
