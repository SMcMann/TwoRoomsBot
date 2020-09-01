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
        message.reply('here are the Two Room and a Boom Roles: \n')
        for (role of roles) {
            let embed = {
                color: 0x0099ff,
                title: `Role: ${role.name}`,
                description: `${role.rules}`,
                timestamp: new Date()
            };
            message.channel.send({ embed }); // this is how you send a Private message
        }
    }//execute
}