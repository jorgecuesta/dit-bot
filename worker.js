const Q = require('q');
const _ = require('lodash');
const querystring = require('querystring');
const rp = require('request-promise-native');
const Discord = require('discord.js');
const logger = require('winston');
const Traveler = require('the-traveler').default;
const DestinyStatsGroupType = require('the-traveler/build/enums').DestinyStatsGroupType;
const TypeDefinition = require('the-traveler/build/enums').TypeDefinition;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = 'debug';

const token = 'NDMzNzk1OTM4NzA0Njg3MTA0.DbBMzg.tQxlx0vx6wW7OIGqhySf7JHU6YM';
// Initialize Discord Bot
const bot = new Discord.Client();

const traveler = new Traveler({
  apikey: '1ce223b722b146f89a7446a9cc6ebb94',
  userAgent: 'dit-bot', // used to identify your request to the API
  debug: true,
});

const bungiebase = 'https://bungie.net';
const ditbase = 'https://db.destinytracker.com/d2/es/items/';

let locales = {
  'Spanish': 'es',
};

rp({
  method: 'GET',
  uri: 'https://www.bungie.net/Platform/GetAvailableLocales',
  headers: {
    'X-API-Key': '1ce223b722b146f89a7446a9cc6ebb94',
  },
  json: true,
}).then(function(response) {
  locales = response.Response;
}).catch(function(error) {
  logger.error(error, 'unable to read locales');
});

logger.info('starting bot');

const itemTypeMap = {
  'armaduras': 2,
  'armadura': 2,
  'armas': 3,
  'arma': 3,
  'emblemas': 14,
  'emblema': 14,
  'mods': 19,
  'mod': 19,
  'naves': 21,
  'nave': 21,
  'colibris': 22,
  'colibri': 22,
  'emotes': 23,
  'emote': 23,
  'ghosts': 24,
  'ghost': 24,
};

const commands = ['buscar', 'ayuda'];

const commandNotFound = function(message, requiredHelp = false) {
  const embed = new Discord.RichEmbed()
      .setTitle('Ayuda')
      .setColor(0x00AE86)
      .setTimestamp()
      .addField('Comandos', commands.join(', '), true);

  if (!requiredHelp) embed.setDescription('El comando que invocaste no existe.');

  message.channel.send({embed});
};

bot.on('ready', function() {
  logger.info('I am ready!');
});

bot.on('disconnect', function(errMsg, code) {
  logger.info(arguments);
  logger.error(errMsg, code);
});

bot.on('message', async function(message) {
  if (message.author.bot) return;
  if (message.content.indexOf('!') !== 0) return;
  logger.debug('Incoming message');
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`

  // This is the best way to define args. Trust me.
  const args = message.content.slice(1).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  switch (cmd) {
    case 'buscar':
      const type = itemTypeMap[args.shift().toLowerCase()];
      const term = args.join(' ');

      if (!type || term.length === 0) {
        const embed = new Discord.RichEmbed()
            .setTitle('Ayuda')
            .setColor(0x00AE86)
            .setDescription('Para buscar debes poner algo como esto: !buscar [opciones] [busqueda]')
            .setTimestamp()
            .addField('Opciones', _.keys(itemTypeMap).join(', '), true);

        message.channel.send({embed});
        return;
      }

      logger.debug('term of search', term);

      const response = await traveler.searchDestinyEntities(
          querystring.escape(term),
          TypeDefinition.DestinyInventoryItemDefinition,
          {
            groups: [DestinyStatsGroupType.Weapons, DestinyStatsGroupType.UniqueWeapon],
            lc: locales.SpanishMexican || locales.Spanish,
          },
      );

      const requests = response.Response.results.results.map(function(result) {
        const displayProperties = _.get(result, 'displayProperties');
        return traveler.getDestinyEntityDefinition(
            TypeDefinition.DestinyInventoryItemDefinition, result.hash,
        ).then(function(response) {
          return {
            display: displayProperties,
            data: response.Response,
            hash: result.hash,
          };
        });
      });

      let results = await Q.allSettled(requests);

      results = _.compact(results.map(r => r.state === 'fulfilled' ? r.value : null));
      const filtered = results.filter(r => r.data.itemType === type);

      if (filtered.length === 0) {
        commandNotFound(message);
        return;
      }

      filtered.forEach(result => {
        const display = result.display;
        const data = result.data;
        const hashedName = display.name.toLowerCase().split(/ +/g).join('-');
        const dit = `${ditbase}${result.hash}-${hashedName}`;
        const embed = new Discord.RichEmbed()
            .setTitle(display.name)
            .setColor(0x00AE86)
            .setDescription(display.description)
            .setTimestamp()
            .setURL(dit);

        if (data.screenshot) {
          embed.setImage(`${bungiebase}${data.screenshot}`);
        } else if (display.hasIcon) {
          embed.setThumbnail(`${bungiebase}${display.icon}`);
        }

        message.channel.send({embed});
      });

      break;

    case 'ayuda':
      commandNotFound(message, true);
      return;
    default:
      commandNotFound(message);
      return;
  }

});

logger.info('bot started');

bot.login(token);

//
