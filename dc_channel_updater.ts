//go through all servers check if they have the discord_bot.json config, if not, create it. else create an object for that server in the config.

// Path: dc_channel_updater.js
//here a class that gets objected for each found config file.
//this class will handle all the updates for each server.
import dotenv from 'dotenv';
if (globalThis.config == undefined || globalThis.config.parsed == undefined) {
  ////console.log("reading config again")
  globalThis.config = dotenv.config();
  if (globalThis.config == undefined || globalThis.config.parsed == undefined) {
    ////console.log("Malformed .env File, please fix")
    process.exit()
  }
}
let currently_running = false;
const serverpath = globalThis.config.parsed.SERVER_FILES_DIR;
import fs from 'fs';
import { ChannelType, Client, Guild, TextChannel } from 'discord.js';
const DEFAULT_CONFIG = './default_config.json'
const DEFAULT_CONFIG_FILE = fs.readFileSync(DEFAULT_CONFIG)
let client;
let pteroclient;
let instances: Array<serverinstance> = [];
const dc_bot = {
  minutely_update: function (servers: serverHolder) {
    let time = 0;
    console.log("running update")
    if (!currently_running) {
      currently_running = true;
      setTimeout(() => { currently_running = false }, 10 * 1000)
    }
    else {
      return;
    }
    servers.data.forEach(async (server) => {
      //////console.log(JSON.stringify(server));
      //check if already exists
      let found = false;
      instances.forEach((instance: serverinstance) => {
        if (instance.uuid == server.attributes.uuid) {
          time += 5000;
          found = true;
          setTimeout(() => { instance.update_channel() },time)
        }
      });
      if (!found) {
        time += 5000;
        console.log("found new server")
        setTimeout(() => { instances.push(new serverinstance(client, globalThis.application, globalThis.pteroclient, server.attributes.uuid)); },time)
        
      }
    });

  },
  init: async function (client, application, pteroclient) {
    let time = 0;
    //loop over all servers
    console.log("init")
    application.getAllServers().then(async (servers) => {

      console.log("servers")
      //for each server create a new instance
      servers.data.forEach(async (server, index) => {
        //////console.log(JSON.stringify(server));
        let skip = false;
        instances.forEach((i) => {
          if (i.uuid == server.attributes.uuid)
            skip = true;
        })
        if(!skip)
        {
        console.log("initing")
        time += 5000;
        setTimeout(() => {instances.push(new serverinstance(client, application, globalThis.pteroclient, server.attributes.uuid))},time);
        }
        //console.log(index)
      });
    })
    console.log("init done");
  }
}

//IMPORTANT The first line in all dc channels will always be the serverid. This is to identify the server.
class serverinstance {//TODO: Move Configs/defaults
  public client
  public application;
  public pteroclient;
  public server;
  public channel: TextChannel;
  public channel_created;
  public uuid;
  public json_global;
  public json_config;
  constructor(client, application, pteroclient, uuid) {
    instances.forEach((i) => {
      if (i.uuid == uuid)
        return i;
    }) // prevent duplicates
    this.client = globalThis.client;
    this.application = application;
    this.pteroclient = pteroclient;
    this.server = null;
    this.channel = undefined;
    this.channel_created = false;
    this.uuid = uuid;
    this.update_channel()
    this.json_config = get_config_of_server(uuid);
    return this;
  }
  update_channel() {
    this.check_create_channel();
    if (this.channel != undefined)
      this.create_text();
    //get the server
    //get the channel
    //update the channel
  }
  check_if_we_exist() {
    //check for deletion of this server
    const test = this.application.getServerDetails(this.uuid);
    if (test == null) {
      //delete this instance
      try {
        instances = instances.filter((instance) => instance.uuid !== this.uuid);
        this.channel.delete();
      } catch (e) {
        return false
      }
    }
  }
  async check_create_channel() {//WORKING
    //this.check_if_we_exist();
    //check if our channel exists by using the server uuid
    //if not create it
    //check if first message of each channel contains uuid
    //also check wether written by bot.
    ////console.log("starting fetch")

    let was_sucess = false;
    const config = get_config_of_server(this.uuid);
    findChannel(this.client, this.uuid,  (channel) => {
      was_sucess = true;
      if (channel != undefined)
        this.channel = channel;

      
      if (config == undefined || config.create_channel == undefined || config.create_channel == false) {
        if (this.channel != undefined) {
          this.channel.delete()
        }
        if (channel != undefined)
          channel.delete()
        this.channel = undefined;
        return;
      }
    }, async () => {
      if (was_sucess)
        return;
      if (config == undefined || config.create_channel == undefined || config.create_channel == false) {
        if (this.channel != undefined)
          this.channel.delete()
        this.channel = undefined;
        return;
      }
      if (this.channel == undefined) {
        //create channel
        const server = await getServer(this.uuid, this.application);
        let channel_name = 'deleteme';
        if (server != null) {
          channel_name = server.attributes.name;
        }
        console.log('creating channel for ' + this.uuid);
        this.channel = await create_channel(channel_name, this.client, this.uuid)
        this.create_text()
      }
    })

  }
  async create_text() {
      if (this.channel == undefined)
        return;
      const cfg: serverconfig = get_config_of_server(this.uuid);
      if (cfg == undefined)
        return;

      await this.channel.messages.fetch()
      const messages = await this.channel.messages.cache.entries();

      console.log("fixing channel")
      if (cfg.channel_name != undefined && cfg.channel_name != "" && this.channel.name != cfg.channel_name)
        this.channel.setName(cfg.channel_name, "Config change");
      for (const [messageId, message] of messages) {
        //const count : number = messages.size;
        if (message.author.id == globalThis.client.user.id) {
          if (message.content.indexOf(this.uuid) != -1) {
            //this is the channelmessage yayy
            const new_content = Create_Modpack_description(this.uuid, cfg)
            message.edit(new_content)
          }
        }
      }
  }
}
async function getServer(uuid, application) {
  try {
    const servers = await globalThis.application.getAllServers();
    if (!servers || !servers.data) {
      throw new Error('Invalid response structure');
    }
    console.log('got servers');
    const my_server = servers.data.find((server) => server.attributes.uuid === uuid);
    return my_server;
  } catch (error) {
    console.error('Error fetching servers:', error);
    return null;
  }
}
///TODO
function get_config_of_server(uuid) {
  //check if in Path of uuid a discord_bot.json file exists
  //if not create one
  const path = serverpath + uuid + '/';
  const file_path = path + 'discord_bot.json';
  let local_cfg: serverconfig;
  if (fs.existsSync(path)) {
    if (!fs.existsSync(file_path)) {
      console.log("creating empty config")
      fs.writeFileSync(file_path, DEFAULT_CONFIG_FILE);
    }
    //check if config is valid
    try {
      local_cfg = JSON.parse(fs.readFileSync(file_path).toString());
    } catch (e) {
      console.log('error creating config for ' + uuid);
      local_cfg = undefined;
    }
  }
  else {
    console.log(path)
  }
  return local_cfg;
}

const findChannel = async (client: Client, uuid: string, callback_success, callback_fail) => {
  console.log("fetching")
  await client.guilds.fetch();
  const guilds = client.guilds.cache;

  for (const [guildId, guild] of guilds) {

    if (guild.id == globalThis.config.parsed.GUILD_ID) {
      await guild.channels.fetch();
      const channels = guild.channels.cache;

      for (const [channelId, channel] of channels) {
        
        // only type 0 (text based)
        if (channel.type == 0 && channel.parentId == globalThis.config.parsed.PARENT_CHANNEL) {
 
          await channel.messages.fetch();
          const messages = await channel.messages.cache;

          for (const [messageId, message] of messages) {
            if (message.content.includes(uuid)) {
              console.log("found " + channel.name);
              setTimeout(((channel,callback)=>{callback(channel)}).bind(null,channel,callback_success), 10);
              return; //stop looping
            }
          }
        }
      }
    }
  }
    console.log("could not find " + uuid)
    setTimeout(((callback)=>{callback()}).bind(null,callback_fail), 10);
    callback_fail();
};

const create_channel = async (channel_name: string, client: Client, uuid: string): Promise<TextChannel> => {
  let returner: TextChannel;
  const config: serverconfig = get_config_of_server(uuid);
  if (config != undefined && config.channel_name != undefined && config.channel_name != "")
    channel_name = config.channel_name;
  const guild: Guild = client.guilds.cache.get(globalThis.config.parsed.GUILD_ID);
  await guild.channels
    .create({
      name: channel_name,
      type: ChannelType.GuildText,
      /*      permissionOverwrites: [
              {
                id: guild.roles.everyone,
                allow: [
                  PermissionFlagsBits.AddReactions,
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.ReadMessageHistory,
                ], //history and emojis
                deny: [
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.EmbedLinks,
                  PermissionFlagsBits.AttachFiles,
                  PermissionFlagsBits.UseExternalEmojis,
                ],
              },
            ],*/
    })
    .then(async (channel) => {
      returner = channel;
      //set category
      await returner.setParent(globalThis.config.parsed.PARENT_CHANNEL);
      await channel.send('||' + uuid + '||');
    })
    .catch(console.error);
  return returner;
}
function Create_Modpack_description(uuid, config: serverconfig) {
  let content = `||${uuid}||\n`;
  if (config.modpack_name != undefined && config.modpack_name != "")
    content += `# ${config.modpack_name}:\n`

  if (config.channel_title != undefined && config.channel_title != "")
    content += `## ${config.channel_title}\n`

  if (config.channel_description != undefined && config.channel_description != "")
    content += `#### ${config.channel_description}\n`

  if (config.modpack_type != undefined && config.modpack_type != "") {
    content += `### Modpack Ist Installierbar auf:\n`
    content += `> ${config.modpack_type}\n`
  }

  if (config.modpack_url != undefined && config.modpack_url != "")
    content += `### [Link zum modpack](${config.modpack_url})\n`

  if (config.additional_info != undefined && config.additional_info != "")
    content += `> #### ${config.additional_info}\n`

  if (config.link_1 != undefined && config.link_1 != "")
    if (config.link_1_text != undefined && config.link_1_text != "")
      content += `### [${config.link_1_text}](${config.link_1})\n`
    else
      content += `### [Download link](${config.link_1})\n`

  if (config.link_2 != undefined && config.link_2 != "")
    if (config.link_2_text != undefined && config.link_2_text != "")
      content += `### [${config.link_2_text}](${config.link_2})\n`
    else
      content += `### [Download link](${config.link_2})\n`
  content += `‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗\n`
  content += `Server Adresse:\n\`\`\`${config.server_address}\`\`\`\n`

  if (config.footer != undefined && config.footer != "")
    content += `${config.footer}\n`
  return content
}

export default dc_bot;
