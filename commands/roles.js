const Discord = require('discord.js');
const rolesArray = require('../data/roles.json');
const specialRoles = require('../data/specialroles.json');

let roles = [...rolesArray, ...specialRoles];

module.exports = {
    name: 'roles', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    cooldown: 0,
    description: 'This command returns the availible roles.',
    args: false, 
    execute(message, args){
        let msg = 'Two Room and a Boom Roles: \n'
        for (role of roles) {
            msg = `${msg} :white_small_square: ${role.name} | ${role.color} | ${role.rules}\n` 
        }
        message.reply(msg); // this is how you send a Private message
    }//execute
}