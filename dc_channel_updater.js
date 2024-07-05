"use strict";
//go through all servers check if they have the discord_bot.json config, if not, create it. else create an object for that server in the config.
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
// Path: dc_channel_updater.js
//here a class that gets objected for each found config file.
//this class will handle all the updates for each server.
var serverpath = config.parsed.SERVER_FILES_DIR;
var fs_1 = require("fs");
var discord_js_1 = require("discord.js");
var default_config_json_1 = require("./default_config.json");
var client;
var application;
var pteroclient;
var instances = [];
module.exports.dc_bot.minutely_update = function (servers) {
    var _this = this;
    //get all servers TODO
    //get all configs TODO
    //get all channels TODO
    //update all channels TODO
    servers.data.forEach(function (server) { return __awaiter(_this, void 0, void 0, function () {
        var found_1;
        return __generator(this, function (_a) {
            //console.log(JSON.stringify(server));
            if (server.attributes.uuid == 'acb86bdf-b6e3-45f2-ac5a-993aff704ab7') {
                found_1 = false;
                instances.forEach(function (instance) {
                    if (instance.uuid == server.attributes.uuid) {
                        found_1 = true;
                    }
                });
                if (!found_1) {
                    instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
                }
            }
            return [2 /*return*/];
        });
    }); });
};
module.exports.dc_bot.init = function (client, application, pteroclient) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            //loop over all servers
            application.getAllServers().then(function (servers) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    //for each server create a new instance
                    servers.data.forEach(function (server) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            //console.log(JSON.stringify(server));
                            if (server.attributes.uuid == 'acb86bdf-b6e3-45f2-ac5a-993aff704ab7') {
                                instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    });
};
//IMPORTANT The first line in all dc channels will always be the serverid. This is to identify the server.
var serverinstance = /** @class */ (function () {
    function serverinstance(client, application, pteroclient, uuid) {
        instances.forEach(function (i) {
            if (i.uuid == uuid)
                return i;
        }); // prevent duplicates
        this.client = client;
        this.application = application;
        this.pteroclient = pteroclient;
        this.server = null;
        this.channel = null;
        this.channel_created = false;
        this.uuid = uuid;
        this.check_create_channel();
        this.json_config = get_config_of_server(uuid);
        return this;
    }
    serverinstance.prototype.update_channel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    serverinstance.prototype.check_if_we_exist = function () {
        var _this = this;
        //check for deletion of this server
        var test = this.application.getServerDetails(this.uuid);
        if (test == null) {
            //delete this instance
            try {
                instances = instances.filter(function (instance) { return instance.uuid !== _this.uuid; });
                this.channel.delete();
            }
            catch (e) {
                return false;
            }
        }
    };
    serverinstance.prototype.check_create_channel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var iszero, server, channelname, guild;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //this.check_if_we_exist();
                        //check if our channel exists by using the server uuid
                        //if not create it
                        //check if first messageof each channel contains uuid
                        //also check wether written by bot.
                        this.channel_created = true;
                        iszero = true;
                        return [4 /*yield*/, this.client.guilds.fetch()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.client.guilds.cache.each(function (guild) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(guild == config.parsed.GUILD_ID)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, guild.channels.cache.each(function (channel) { return __awaiter(_this, void 0, void 0, function () {
                                                    var _this = this;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (!(channel.type === 0)) return [3 /*break*/, 2];
                                                                return [4 /*yield*/, channel.messages.fetch({ limit: 20 }).then(function (messages) { return __awaiter(_this, void 0, void 0, function () {
                                                                        var success;
                                                                        var _this = this;
                                                                        return __generator(this, function (_a) {
                                                                            //fetch the last 20 messages
                                                                            //if contains uuid inside string
                                                                            //filter to
                                                                            iszero = false;
                                                                            success = false;
                                                                            messages.forEach(function (message) {
                                                                                if (message.content.indexOf(_this.uuid) !== -1) {
                                                                                    console.log('found channel for ' + _this.uuid);
                                                                                    _this.channel = channel;
                                                                                    _this.channel_created = true;
                                                                                    success = true;
                                                                                    return;
                                                                                }
                                                                            });
                                                                            if (success == false)
                                                                                this.channel_created = false;
                                                                            return [2 /*return*/];
                                                                        });
                                                                    }); })];
                                                            case 1:
                                                                _a.sent();
                                                                _a.label = 2;
                                                            case 2: return [2 /*return*/];
                                                        }
                                                    });
                                                }); })];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        if (!(this.channel_created == false || iszero)) return [3 /*break*/, 5];
                        return [4 /*yield*/, getServer(this.uuid, this.application)];
                    case 3:
                        server = _a.sent();
                        channelname = 'deleteme';
                        if (server != null) {
                            channelname = server.attributes.name;
                        }
                        console.log('creating channel for ' + this.uuid);
                        guild = this.client.guilds.cache.get(config.parsed.GUILD_ID);
                        return [4 /*yield*/, guild.channels
                                .create({
                                name: channelname,
                                type: discord_js_1.ChannelType.GuildText,
                                permissionOverwrites: [
                                    {
                                        id: guild.roles.everyone,
                                        allow: [
                                            discord_js_1.PermissionFlagsBits.AddReactions,
                                            discord_js_1.PermissionFlagsBits.ViewChannel,
                                            discord_js_1.PermissionFlagsBits.ReadMessageHistory,
                                        ], //history and emojies
                                        deny: [
                                            discord_js_1.PermissionFlagsBits.SendMessages,
                                            discord_js_1.PermissionFlagsBits.EmbedLinks,
                                            discord_js_1.PermissionFlagsBits.AttachFiles,
                                            discord_js_1.PermissionFlagsBits.UseExternalEmojis,
                                        ],
                                    },
                                ],
                            })
                                .then(function (channel) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.channel = channel;
                                            //set category
                                            return [4 /*yield*/, this.channel.setParent(config.parsed.PARENT_CHANNEL)];
                                        case 1:
                                            //set category
                                            _a.sent();
                                            return [4 /*yield*/, channel.send('||' + this.uuid + '||')];
                                        case 2:
                                            _a.sent();
                                            this.channel_created = true;
                                            console.log('channel created');
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(console.error)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    serverinstance.prototype.create_text = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cfg;
            return __generator(this, function (_a) {
                cfg = get_config_of_server(this.uuid);
                this.client.guilds.cache.get(config.parsed.GUILD_ID).channels.cache.forEach(function (channel) {
                    // only type 0
                    if (channel.type === 0) {
                        channel.messages.fetch({ limit: 20 }).then(function (messages) {
                            //fetch the last 20 messages
                        });
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    return serverinstance;
}());
function getServer(uuid, application) {
    return __awaiter(this, void 0, void 0, function () {
        var servers, my_server, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, application.getAllServers()];
                case 1:
                    servers = _a.sent();
                    if (!servers || !servers.data) {
                        throw new Error('Invalid response structure');
                    }
                    console.log('got servers');
                    my_server = servers.data.find(function (server) { return server.attributes.uuid === uuid; });
                    console.log(JSON.stringify(my_server));
                    return [2 /*return*/, my_server];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching servers:', error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
///TODO
function get_config_of_server(uuid) {
    //check if in Path of uuid a discord_bot.json file exists
    //if not create one
    var path = serverpath + uuid + '\\';
    var file_path = path + 'discord_bot.json';
    var local_cfg = {};
    if (fs_1.default.existsSync(path)) {
        if (!fs_1.default.existsSync(path)) {
            fs_1.default.writeFileSync(file_path, JSON.stringify(default_config_json_1.default));
        }
        //check if config is valid
        try {
            local_cfg = JSON.parse(fs_1.default.readFileSync(file_path).toString());
        }
        catch (e) {
            console.log('error creating config for ' + this.uuid);
            local_cfg = {};
        }
    }
    return local_cfg;
}
exports.default = module.exports.dc_bot;
