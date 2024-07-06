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
    ////console.log("reading config again")
    globalThis.config = dotenv.config();
    if (globalThis.config == undefined || globalThis.config.parsed == undefined) {
        ////console.log("Malformed .env File, please fix")
        process.exit();
    }
}
const serverpath = globalThis.config.parsed.SERVER_FILES_DIR;
import fs from 'fs';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
const DEFAULT_CONFIG = './default_config.json';
const DEFAULT_CONFIG_FILE = fs.readFileSync(DEFAULT_CONFIG);
let client;
let application;
let pteroclient;
let instances = [];
const dc_bot = {
    minutely_update: function (servers) {
        servers.data.forEach((server) => __awaiter(this, void 0, void 0, function* () {
            //////console.log(JSON.stringify(server));
            //check if already exists
            let found = false;
            instances.forEach((instance) => {
                if (instance.uuid == server.attributes.uuid) {
                    found = true;
                    instance.update_channel();
                }
            });
            if (!found) {
                instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
            }
        }));
    },
    init: function (client, application, pteroclient) {
        return __awaiter(this, void 0, void 0, function* () {
            //loop over all servers
            //console.log("init")
            application.getAllServers().then((servers) => __awaiter(this, void 0, void 0, function* () {
                //console.log("servers")
                //for each server create a new instance
                servers.data.forEach((server, index) => __awaiter(this, void 0, void 0, function* () {
                    //////console.log(JSON.stringify(server));
                    //console.log(index)
                    instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
                    //console.log(index)
                }));
            }));
            //console.log("init done");
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
        this.update_channel();
        this.json_config = get_config_of_server(uuid);
        return this;
    }
    update_channel() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.check_create_channel();
            if (this.channel != undefined)
                yield this.create_text();
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
            //check if first message of each channel contains uuid
            //also check wether written by bot.
            this.channel_created = true;
            yield this.client.guilds.fetch();
            ////console.log("starting fetch")
            yield findChannel(this.client, this.uuid).then((channel) => __awaiter(this, void 0, void 0, function* () {
                this.channel = channel;
                const config = get_config_of_server(this.uuid);
                if (config == undefined || config.create_channel == undefined || config.create_channel == false) {
                    if (this.channel != undefined)
                        this.channel.delete();
                    this.channel = undefined;
                    return;
                }
                if (this.channel == undefined) {
                    //create channel
                    const server = yield getServer(this.uuid, this.application);
                    let channel_name = 'deleteme';
                    if (server != null) {
                        channel_name = server.attributes.name;
                    }
                    ////console.log('creating channel for ' + this.uuid);
                    this.channel = yield create_channel(channel_name, this.client, this.uuid);
                }
            }));
        });
    }
    create_text() {
        return __awaiter(this, void 0, void 0, function* () {
            yield findChannel(this.client, this.uuid).then((channel) => __awaiter(this, void 0, void 0, function* () {
                if (channel == undefined)
                    return;
                const cfg = get_config_of_server(this.uuid);
                if (cfg == undefined)
                    return;
                const messages = yield channel.messages.fetch();
                //console.log("fixing channel")
                if (cfg.channel_name != undefined && cfg.channel_name != "" && channel.name != cfg.channel_name)
                    channel.setName(cfg.channel_name, "Config change");
                messages.forEach((message) => {
                    //const count : number = messages.size;
                    if (message.author.id == globalThis.client.user.id) {
                        if (message.content.indexOf(this.uuid) != -1) {
                            //this is the channelmessage yayy
                            const new_content = Create_Modpack_description(this.uuid, cfg);
                            message.edit(new_content);
                        }
                    }
                });
                ////console.log(cfg);
            }));
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
            ////console.log('got servers');
            const my_server = servers.data.find((server) => server.attributes.uuid === uuid);
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
    let local_cfg;
    if (fs.existsSync(path)) {
        if (!fs.existsSync(file_path)) {
            //console.log("creating empty config")
            fs.writeFileSync(file_path, DEFAULT_CONFIG_FILE);
        }
        //check if config is valid
        try {
            local_cfg = JSON.parse(fs.readFileSync(file_path).toString());
        }
        catch (e) {
            //console.log('error creating config for ' + uuid);
            local_cfg = undefined;
        }
    }
    return local_cfg;
}
const findChannel = (client, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    let return_this_channel;
    yield new Promise((resolve) => {
        client.guilds.cache.each((guild) => __awaiter(void 0, void 0, void 0, function* () {
            if (guild.id == globalThis.config.parsed.GUILD_ID) {
                yield guild.channels.cache.each((channel) => __awaiter(void 0, void 0, void 0, function* () {
                    // only type 0 (text based)
                    if (channel.type === 0 && channel.parent != undefined &&
                        channel.parent != null && channel.parent.id == config.parsed.PARENT_CHANNEL) {
                        yield channel.messages.fetch({ limit: 20 }).then((messages) => __awaiter(void 0, void 0, void 0, function* () {
                            //* Last 20 msgs
                            let is_this_the_one = false;
                            yield messages.every((message) => __awaiter(void 0, void 0, void 0, function* () {
                                ////console.log(message.content.indexOf(uuid) != -1);
                                if (message.content.indexOf(uuid) != -1) {
                                    is_this_the_one = true;
                                    return false; //stop looping
                                }
                                return true; //continue looping
                            }));
                            if (is_this_the_one) {
                                return_this_channel = channel;
                                resolve(return_this_channel);
                            }
                        }));
                    }
                }));
            }
        }));
        setTimeout(() => {
            resolve(return_this_channel);
        }, 1000);
    });
    return return_this_channel;
});
const create_channel = (channel_name, client, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    let returner;
    const config = get_config_of_server(uuid);
    if (config != undefined && config.channel_name != undefined && config.channel_name != "")
        channel_name = config.channel_name;
    const guild = client.guilds.cache.get(globalThis.config.parsed.GUILD_ID);
    yield guild.channels
        .create({
        name: channel_name,
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
        .then((channel) => __awaiter(void 0, void 0, void 0, function* () {
        returner = channel;
        //set category
        yield returner.setParent(globalThis.config.parsed.PARENT_CHANNEL);
        yield channel.send('||' + uuid + '||');
    }))
        .catch(console.error);
    return returner;
});
function Create_Modpack_description(uuid, config) {
    let content = `||${uuid}||\n`;
    if (config.modpack_name != undefined && config.modpack_name != "")
        content += `# ${config.modpack_name}:\n`;
    if (config.channel_title != undefined && config.channel_title != "")
        content += `## ${config.channel_title}\n`;
    if (config.channel_description != undefined && config.channel_description != "")
        content += `#### ${config.channel_description}\n`;
    if (config.modpack_type != undefined && config.modpack_type != "") {
        content += `### Modpack Ist Installierbar auf:\n`;
        content += `> ${config.modpack_type}\n`;
    }
    if (config.modpack_url != undefined && config.modpack_url != "")
        content += `### [Link zum modpack](${config.modpack_url})\n`;
    if (config.additional_info != undefined && config.additional_info != "")
        content += `> #### ${config.additional_info}\n`;
    if (config.link_1 != undefined && config.link_1 != "")
        if (config.link_1_text != undefined && config.link_1_text != "")
            content += `### [${config.link_1_text}](${config.link_1})\n`;
        else
            content += `### [Download link](${config.link_1})\n`;
    if (config.link_2 != undefined && config.link_2 != "")
        if (config.link_2_text != undefined && config.link_2_text != "")
            content += `### [${config.link_2_text}](${config.link_2})\n`;
        else
            content += `### [Download link](${config.link_2})\n`;
    content += `‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗\n`;
    content += `Server Adresse:\n\`\`\`${config.server_address}\`\`\`\n`;
    if (config.footer != undefined && config.footer != "")
        content += `${config.footer}\n`;
    return content;
}
export default dc_bot;
