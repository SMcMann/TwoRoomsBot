const { gameReport, checkLive } = require('../data/database');
const { roles } = require('../data/serverValues');

module.exports = {
    name: 'report', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['gamereport'],
    cooldown: 0,
    description: 'Sends the requester a report of the current game state',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') {
            message.reply(`The !report command must be done on server by an admin.`)            
            return;
        }

        message.delete({ timeout: 500 })

        if (!message.member.roles.cache.some(el => el.name === roles.admin)) {
            message.reply('Only an admin can use this command.')
                .then(sentMessage => {
                    sentMessage.delete({ timeout: 5000 })
                });
            return;
        }
        
        if (!checkLive()) {
            message.reply('No game is active, you must initate a game to get a report!');
            return;
        };
        console.log(`${message.author.username} has requested the game report...`)
        message.author.send({ embed: gameReport() })
            .then(console.log(`${message.author.username} has been sent the game report...`))
            .catch(console.error);
    }//execute
}