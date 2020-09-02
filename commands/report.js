const Discord = require('discord.js');
const database = require('../data/database');

module.exports = {
    name: 'report', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'Sends the requester a report of the current game state',
    args: false, 
    execute(message, args){
        message.delete({ timeout: 500 })
        console.log(`${message.author.username} has requested the game report...`)
        message.author.send(database.gameReport())
            .then(console.log(`${message.author.username} has been sent the game report...`))
            .catch(console.error);
    }//execute
}