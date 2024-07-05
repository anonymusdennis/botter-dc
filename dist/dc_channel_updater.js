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
// Path: dc_channel_updater.js
//here a class that gets objected for each found config file.
//this class will handle all the updates for each server.
import dotenv from 'dotenv';
if (globalThis.config == undefined || globalThis.config.parsed == undefined) {
    console.log("reading config again");
    globalThis.config = dotenv.config();
    if (globalThis.config == undefined || globalThis.config.parsed == undefined) {
        console.log("Malformed .env File, please fix");
        process.exit();
    }
}
const serverpath = globalThis.config.parsed.SERVER_FILES_DIR;
import fs from 'fs';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import default_file from './default_config.json';
let client;
let application;
let pteroclient;
let instances = [];
const dc_bot = {
    minutely_update: function (servers) {
        //get all servers TODO
        //get all configs TODO
        //get all channels TODO
        //update all channels TODO
        servers.data.forEach((server) => __awaiter(this, void 0, void 0, function* () {
            //console.log(JSON.stringify(server));
            if (server.attributes.uuid == 'acb86bdf-b6e3-45f2-ac5a-993aff704ab7') {
                //check if already exists
                let found = false;
                instances.forEach((instance) => {
                    if (instance.uuid == server.attributes.uuid) {
                        found = true;
                    }
                });
                if (!found) {
                    instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
                }
            }
        }));
    },
    init: function (client, application, pteroclient) {
        return __awaiter(this, void 0, void 0, function* () {
            //loop over all servers
            application.getAllServers().then((servers) => __awaiter(this, void 0, void 0, function* () {
                //for each server create a new instance
                servers.data.forEach((server) => __awaiter(this, void 0, void 0, function* () {
                    //console.log(JSON.stringify(server));
                    if (server.attributes.uuid == 'acb86bdf-b6e3-45f2-ac5a-993aff704ab7') {
                        instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
                    }
                }));
            }));
        });
    }
};
//IMPORTANT The first line in all dc channels will always be the serverid. This is to identify the server.
class serverinstance {
    constructor(client, application, pteroclient, uuid) {
        instances.forEach((i) => {
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
    update_channel() {
        return __awaiter(this, void 0, void 0, function* () {
            //get the server
            //get the channel
            //update the channel
        });
    }
    check_if_we_exist() {
        //check for deletion of this server
        const test = this.application.getServerDetails(this.uuid);
        if (test == null) {
            //delete this instance
            try {
                instances = instances.filter((instance) => instance.uuid !== this.uuid);
                this.channel.delete();
            }
            catch (e) {
                return false;
            }
        }
    }
    check_create_channel() {
        return __awaiter(this, void 0, void 0, function* () {
            //this.check_if_we_exist();
            //check if our channel exists by using the server uuid
            //if not create it
            //check if first messageof each channel contains uuid
            //also check wether written by bot.
            this.channel_created = true;
            let iszero = true;
            yield this.client.guilds.fetch();
            yield this.client.guilds.cache.each((guild) => __awaiter(this, void 0, void 0, function* () {
                if (guild == globalThis.config.parsed.GUILD_ID) {
                    yield guild.channels.cache.each((channel) => __awaiter(this, void 0, void 0, function* () {
                        // only type 0
                        if (channel.type === 0) {
                            yield channel.messages.fetch({ limit: 20 }).then((messages) => __awaiter(this, void 0, void 0, function* () {
                                //fetch the last 20 messages
                                //if contains uuid inside string
                                //filter to
                                iszero = false;
                                let success = false;
                                messages.forEach((message) => {
                                    if (message.content.indexOf(this.uuid) !== -1) {
                                        console.log('found channel for ' + this.uuid);
                                        this.channel = channel;
                                        this.channel_created = true;
                                        success = true;
                                        return;
                                    }
                                });
                                if (success == false)
                                    this.channel_created = false;
                            }));
                        }
                    }));
                }
            }));
            if (this.channel_created == false || iszero) {
                //create channel
                const server = yield getServer(this.uuid, this.application);
                let channelname = 'deleteme';
                if (server != null) {
                    channelname = server.attributes.name;
                }
                console.log('creating channel for ' + this.uuid);
                const guild = this.client.guilds.cache.get(globalThis.config.parsed.GUILD_ID);
                yield guild.channels
                    .create({
                    name: channelname,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            allow: [
                                PermissionFlagsBits.AddReactions,
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.ReadMessageHistory,
                            ],
                            deny: [
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.UseExternalEmojis,
                            ],
                        },
                    ],
                })
                    .then((channel) => __awaiter(this, void 0, void 0, function* () {
                    this.channel = channel;
                    //set category
                    yield this.channel.setParent(globalThis.config.parsed.PARENT_CHANNEL);
                    yield channel.send('||' + this.uuid + '||');
                    this.channel_created = true;
                    console.log('channel created');
                }))
                    .catch(console.error);
            }
        });
    }
    create_text() {
        return __awaiter(this, void 0, void 0, function* () {
            const cfg = get_config_of_server(this.uuid);
            this.client.guilds.cache.get(globalThis.config.parsed.GUILD_ID).channels.cache.forEach((channel) => {
                // only type 0
                if (channel.type === 0) {
                    channel.messages.fetch({ limit: 20 }).then((messages) => {
                        //fetch the last 20 messages
                    });
                }
            });
        });
    }
}
function getServer(uuid, application) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const servers = yield application.getAllServers();
            if (!servers || !servers.data) {
                throw new Error('Invalid response structure');
            }
            console.log('got servers');
            const my_server = servers.data.find((server) => server.attributes.uuid === uuid);
            console.log(JSON.stringify(my_server));
            return my_server;
        }
        catch (error) {
            console.error('Error fetching servers:', error);
            return null;
        }
    });
}
///TODO
function get_config_of_server(uuid) {
    //check if in Path of uuid a discord_bot.json file exists
    //if not create one
    const path = serverpath + uuid + '\\';
    const file_path = path + 'discord_bot.json';
    let local_cfg = {};
    if (fs.existsSync(path)) {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(file_path, JSON.stringify(default_file));
        }
        //check if config is valid
        try {
            local_cfg = JSON.parse(fs.readFileSync(file_path).toString());
        }
        catch (e) {
            console.log('error creating config for ' + uuid);
            local_cfg = {};
        }
    }
    return local_cfg;
}
export default dc_bot;
