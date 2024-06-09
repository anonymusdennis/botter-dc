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
const server_uuid_blacklist = [];
const { Client, GatewayIntentBits, } = require('discord.js');
const config = require('dotenv').config()
console.log(config)
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
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

const token = config.parsed.TOKEN;
const Nodeactyl = require('nodeactyl');
const application = new Nodeactyl.NodeactylApplication("https://moddedmc.de", config.parsed.TOKEN_PTERO_APPL );
const pteroclient = new Nodeactyl.NodeactylClient("https://moddedmc.de", config.parsed.TOKEN_PTERO_CLIENT );
const whiteliststuff = require('./whiteliststuff.js');
const dc_channel_updater = require('./dc_channel_updater.js');
client.once('ready', () => {
    console.log('Ready!');
    dc_channel_updater.init(client, application, pteroclient);
    
});
// Application

//commands
client.on('messageCreate', async message => {
    if (!message.inGuild() || message.guildId != '770223774515331093') return;
    await whiteliststuff.on_wl_relevant_message(message);
});

const commandlist = [
    'say §4[!!!WICHTIG!!!]',
    'say Nach längerem Überlegen, und vielen verlorenen Spielern haben wir(das Serverteam) uns nun entschieden:',
    'say Um auf moddedmc.de / mmc.rip zu spielen, müssen sich bald alle Spieler auf dem gleichen DC Server registrieren',
    'say Dies soll bewirken, dass endlich unsere Community wieder zusammenkommt.',
    'say das Ganze wird auf whitelist basis ablaufen und nach Registrierung, werden alle Spieler global auf den gehosteten Servern AUTOMATISCH der whitelistet hinzugefügt.',
    'say Die Server werden weiterhin bis in alle Ewigkeit kostenlos bleiben, dies ist nur eine Maßnahme zum Wiederbeleben aller Modpack/events.',
    'say Um dich später der whitelist hinzuzufügen, einfach dem Server über den untenstehenden Link beitreten',
    'tellraw @a {"text":"DC Server","clickEvent":{"action":"open_url","value":"https://discord.gg/mjA8PfAhea"},"hoverEvent":{"action":"show_text","value":[{"text":"Dem DC server beitreten","bold":true,"color":"dark_blue"}]}}',
    'say und sollte der link oben nicht angezeigt werden, hier nochmal: https://discord.gg/mjA8PfAhea',
    'say Danke für euer Verständnis, diese Änderungen werden erst nach einem Monat Inkrafttreten.',
]
function spammessage_forall() {
    application.getAllServers().then(async servers => {
        servers.data.forEach(async server => {
            //console.log(JSON.stringify(server));
            if (server_uuid_blacklist.includes(server.attributes.uuid)) {
                return;
            }
            if (server.attributes.uuid == '015c5a30-a553-4163-9fc3-f47bb4e71f88') {

                let commanded = []
                try {
                    let sucess = true;
                    let timeout = 0;
                    commandlist.forEach(async command => {
                        timeout += 1000;
                        try {
                            setTimeout(pteroclient.sendServerCommand.bind(pteroclient,server.attributes.uuid, command), timeout);
                        }
                        catch (e) {
                            sucess = false;
                            //exit loop
                            return;
                        }
                    });
                    if (sucess)
                        commanded.push(server);
                }
                catch (e) {
                }
            }
        });

    });
}
//sendcommandtoallservers();
client.login(token);
async function minutely_update(){
    //all things that need to be updated every minute

    
}
spammessage_forall()
setInterval(spammessage_forall, 1000 * 20); // 1 hour
setInterval(minutely_update, 1000 * 60); // 60 seconds
