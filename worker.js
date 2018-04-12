const Discord = require('discord.io');
const logger = require('winston');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: 'NDMzNzk1OTM4NzA0Njg3MTA0.DbBMzg.tQxlx0vx6wW7OIGqhySf7JHU6YM',
    autorun: true
});

logger.info('starting bot');

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('disconnect', function(errMsg, code) {
  logger.info(arguments);
  logger.error(errMsg, code);
});

bot.on('message', function (user, userID, channelID, message, evt) {
    logger.debug('Incoming message');
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
            // Just add any case commands if you want to..
        }
    }
});

logger.info('bot started');
