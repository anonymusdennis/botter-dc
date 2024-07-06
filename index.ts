import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import Nodeactyl from 'nodeactyl';
import wl from './whiteliststuff.js';
import dc_bot from './dc_channel_updater.js';
declare global {
  // eslint-disable-next-line no-var
  var config: dotenv.DotenvConfigOutput;
  // eslint-disable-next-line no-var
  var client: Client<boolean>;
}
globalThis.config = dotenv.config()
const server_uuid_blacklist: Array<string> = [];
if (globalThis.config == undefined || typeof (globalThis.config) != "object" || globalThis.config.parsed == undefined) {
  //console.log("Malformed .env File, please fix")
  process.exit()
}
//console.log(globalThis.config);
globalThis.client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    //create channels
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildWebhooks,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const token = globalThis.config.parsed.TOKEN;

const application = new Nodeactyl.NodeactylApplication('https://moddedmc.de', globalThis.config.parsed.TOKEN_PTERO_APPL);
const pteroclient = new Nodeactyl.NodeactylClient('https://moddedmc.de', globalThis.config.parsed.TOKEN_PTERO_CLIENT);

client.once('ready', () => {
  console.log('Ready!');
  dc_bot.init(client, application, pteroclient);
});
// Application

//commands
client.on('messageCreate', async (message) => {
  if (!message.inGuild() || message.guildId != globalThis.config.parsed?.GUILD_ID) return;
  await wl.on_wl_relevant_message(message);
});

const commandlist = [
  'say §4[!!!WICHTIG!!!]',
  'say Bitte In Zukunft alle Spieler über den Offiziellen Discord Server Informieren. Danke, euer Team!',
];
function spammessage_forall() {
  let timeout = 0;
  application.getAllServers().then(async (servers: serverHolder) => {
    for (const server of servers.data) {
      if (server.attributes.status != null)
        continue;
      ////console.log(JSON.stringify(server));
      if (server_uuid_blacklist.includes(server.attributes.uuid)) {
        return true;
      }
      //if (server.attributes.uuid == '015c5a30-a553-4163-9fc3-f47bb4e71f88') {
        if (server.attributes.uuid != undefined && server.attributes.uuid != "") {
          //console.log(server.attributes.status)
        
        commandlist.forEach( (command) => {
          timeout += 1000;
          try {
            setTimeout(async ()=> {
              try {
                //console.log("aaah" + timeout)
                await pteroclient.sendServerCommand(server.attributes.uuid, command).catch(()=>{//
                  });
                //might fail because server offline
              } catch (error) {
                return;
              }
            }, timeout);
          } catch (e) {
            //exit loop
          }
        });

      }
    }
  });
}
//sendcommandtoallservers();
client.login(token);
async function minutely_update() {
  //console.log("updating..")
  await application.getAllServers().then(async (servers: serverHolder) => {
    dc_bot.minutely_update(servers)
  })
  //console.log("done updating..")
  
  //all things that need to be updated every minute
}
setInterval(spammessage_forall, 1000 * 60 * 60 * 2); // 2 hour
setInterval(minutely_update, 1000 * 60); // 60 seconds
minutely_update()
