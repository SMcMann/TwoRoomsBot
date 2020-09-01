const Discord = require('discord.js');
const roles = require('../data/roles.json');

module.exports = {
    name: 'roles', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'This command returns the availible roles.',
    args: false, 
    execute(message, args){
        let msg = 'Here are the roles we have: \n'
        for (role of roles) {
            msg = `${msg} :white_small_square: ${role.name} | ${role.color} | ${role.rules}\n` 
        }
        message.reply(msg); // this is how you send a Private message
    }//execute
}