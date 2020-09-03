const database = require('../data/database');

module.exports = {
    name: 'report', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['gamereport'],
    cooldown: 0,
    description: 'Sends the requester a report of the current game state',
    args: false, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 2000 })
        console.log(`${message.author.username} has requested the game report...`)
        message.author.send(database.gameReport())
            .then(console.log(`${message.author.username} has been sent the game report...`))
            .catch(console.error);
    }//execute
}