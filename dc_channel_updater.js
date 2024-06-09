//go through all servers check if they have the discord_bot.json config, if not, create it. else create an object for that server in the config.

// Path: dc_channel_updater.js
//here a class that gets objected for each found config file.
//this class will handle all the updates for each server.


const serverpath = 'C:\\test\\servers\\';
const GUILDID = '770223774515331093';
const fs = require('fs');
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('dotenv').config()
(function () {
    const config = require('dotenv').config()
    let client;
    let application;
    let pteroclient;
    let instances = [];
    module.exports.minutely_update = function () {
        //get all servers
        //get all configs
        //get all channels
        //update all channels
        servers.data.forEach(async server => {
            //console.log(JSON.stringify(server));
            if (server.attributes.uuid == 'acb86bdf-b6e3-45f2-ac5a-993aff704ab7') {
                //check if already exists
                let found = false;
                instances.forEach(instance => {
                    if (instance.uuid == server.attributes.uuid) {
                        found = true;
                    }
                });
                if (!found) {
                    instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
                }
            }
        });
    }
    module.exports.init = async function (client, application, pteroclient) {
        //loop over all servers
        application.getAllServers().then(async servers => {
            //for each server create a new instance
            servers.data.forEach(async server => {
                //console.log(JSON.stringify(server));
                if (server.attributes.uuid == 'acb86bdf-b6e3-45f2-ac5a-993aff704ab7') {
                    instances.push(new serverinstance(client, application, pteroclient, server.attributes.uuid));
                }
            });
        });
    }
})();
//IMPORTANT The first line in all dc channels will always be the serverid. This is to identify the server.
class serverinstance {
    constructor(client, application, pteroclient, uuid) {
        this.client = client;
        this.application = application;
        this.pteroclient = pteroclient;
        this.server = null;
        this.channel = null;
        this.channel_created = false;
        this.uuid = uuid;
        this.check_create_channel();
    }
    async update_channel() {
        //get the server
        //get the channel
        //update the channel
    }
    check_if_we_exist() {
        //check for deletion of this server
        let test = this.application.getServerDetails(this.uuid);
        if (test == null) {
            //delete this instance
            try {
                instances = instances.filter(instance => instance.uuid !== this.uuid);
                this.channel.delete();
            }
            catch (e) {
            }
        }
    }
    async check_create_channel() {
        //this.check_if_we_exist();
        //check if our channel exists by using the server uuid
        //if not create it
        //check if first messageof each channel contains uuid
        //also check wether written by bot.
        this.channel_created = false;
        this.client.guilds.cache.get(GUILDID).channels.cache.forEach(channel => {
            // only type 0
            if (channel.type === 0) {
                channel.messages.fetch({ limit: 20 }).then(messages => {//fetch the last 20 messages
                    //if contains uuid inside string
                    //filter to
                    messages.forEach(message => {

                        if (message.content.indexOf(this.uuid) !== -1) {
                            console.log("found channel")
                            this.channel = channel;
                            this.channel_created = true;
                            return;
                        }
                    });
                })
            }
        });
        if (!this.channel_created) {
            //create channel
            let server = await getServer(this.uuid, this.application);
            let channelname = "deleteme";
            if (server != null) {
                channelname = server.attributes.name;
            }
            console.log("creating channel")

            let guild = this.client.guilds.cache.get(GUILDID);
            await guild.channels.create({
                name: channelname,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        allow: [
                            PermissionFlagsBits.AddReactions,
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.ReadMessageHistory,
                        ],//history and emojies
                        deny: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.EmbedLinks,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.UseExternalEmojis,
                        ]
                    },
                ],
            }).then(async channel => {
                this.channel = channel;
                //set category
                await this.channel.setParent(config.parsed.PARENT_CHANNEL);
                await channel.send('||' + this.uuid + '||');
                this.channel_created = true;
                console.log("channel created")
            }).catch(console.error);

        }
    }
}
async function getServer(uuid, application) {
    try {
        const servers = await application.getAllServers();
        if (!servers || !servers.data) {
            throw new Error("Invalid response structure");
        }
        console.log("got servers")
        const my_server = servers.data.find(server => server.attributes.uuid === uuid);

        console.log(JSON.stringify(my_server));
        return my_server;
    } catch (error) {
        console.error("Error fetching servers:", error);
        return null;
    }
}
///TODO
function get_config_of_server(uuid) {
    let path = serverpath + uuid + '\\discord_bot.json';
    if (fs.existsSync(path)) {
        check_fix_create_config(path);
        return JSON.parse(fs.readFileSync(path));
    }
    check_fix_create_config(path);
    return null;
}

function check_fix_create_config(path) {
    const default_file = require('./default_config.json');
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify(default_file));
    }
    //check if config is valid 
    let config = JSON.parse(fs.readFileSync(path));

}