const { gameReport, checkLive } = require('../data/database');

module.exports = {
    name: 'report', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['gamereport'],
    cooldown: 0,
    description: 'Sends the requester a report of the current game state',
    args: false, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 2000 })
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