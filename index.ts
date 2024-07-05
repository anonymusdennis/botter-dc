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

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import Nodeactyl from 'nodeactyl';
import wl from './whiteliststuff.js';
import dc_bot from './dc_channel_updater.js';
declare global {
  // eslint-disable-next-line no-var
  var config: dotenv.DotenvConfigOutput;
}
globalThis.config = dotenv.config()
const server_uuid_blacklist: Array<string> = [];
if (globalThis.config == undefined || typeof (globalThis.config) != "object" || globalThis.config.parsed == undefined) {
  console.log("Malformed .env File, please fix")
  process.exit()
}
console.log(globalThis.config);
const client = new Client({
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
  'say Nach langen überlegen, und Vielen verlorenen Spielern haben wir(das Serverteam) uns nun entschieden:',
  'say Um auf moddedmc.de / mmc.rip zu spielen, Müssen sich bald alle Spieler auf den gleichen DC server um sich zu registrieren',
  'say Dies soll bewirken, dass Endlich unsere Community wieder Zusammenkommt.',
  'say das ganze wird auf whitelist basis ablaufen, und Nach registrierung sind die Spieler global au allen gehosteten Servern AUTOMATISCH gewhitelistet.',
  'say Die Server werden weiterhin bis in alle ewigkeit kostenlos bleiben, Dies ist nur eine Aktion zum Revitalisiern aller Modpack/events.',
  'say Um später dann dich in der whitelist zu adden, einfach in den Untigen DC server joinen',
  'tellraw @a {"text":"DC Server","clickEvent":{"action":"open_url","value":"https://discord.gg/mjA8PfAhea"},"hoverEvent":{"action":"show_text","value":[{"text":"Dem DC server beitreten","bold":true,"color":"dark_blue"}]}}',
  'say und wo der link oben nicht gezeigt wird, hier nochmal: https://discord.gg/mjA8PfAhea',
  'say Danke für euer Verständnis, diese Änderungen werden erst nach einem Monat aktiviert, sodass jeder Zeit bleibt sich zu registrieren.',
];
function spammessage_forall() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  application.getAllServers().then(async (servers: any) => {
    servers.data.forEach(async (server: pteroServer) => {
      //console.log(JSON.stringify(server));
      if (server_uuid_blacklist.includes(server.attributes.uuid)) {
        return;
      }
      if (server.attributes.uuid == '015c5a30-a553-4163-9fc3-f47bb4e71f88') {
        const commanded: Array<pteroServer> = [];
        let success = true;
        let timeout = 0;
        commandlist.forEach(async (command) => {
          timeout += 1000;
          try {
            setTimeout(pteroclient.sendServerCommand.bind(pteroclient, server.attributes.uuid, command), timeout);
          } catch (e) {
            success = false;
            //exit loop
            return;
          }
        });
        if (success) commanded.push(server);

      }
    });
  });
}
//sendcommandtoallservers();
client.login(token);
async function minutely_update() {
  await application.getAllServers().then(async (servers: serverHolder) => {
    dc_bot.minutely_update(servers)
  })
  //all things that need to be updated every minute
}
spammessage_forall();
setInterval(spammessage_forall, 1000 * 20); // 1 hour
setInterval(minutely_update, 1000 * 60); // 60 seconds
