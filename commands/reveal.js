const Discord = require('discord.js');
//const server = require("../data/server.json");
const { roles, getRole }  = require("../data/serverValues");
const assignments = require("../data/database");


module.exports = {
    name: 'reveal', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'Changes member roles to one of Red Team/Blue Team/Gray Team for post game discussion.',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        for (let member of assignments.database) {
            let new_role;
            if (member.character.alignment == "Red") {
                new_role = getRole(message.guild,roles.red);
            } else if (member.character.alignment == "Blue") {
                new_role = getRole(message.guild,roles.blue);
            } else {
                new_role = getRole(message.guild,roles.gray);
            }
            member.player.roles.add(new_role)
                .then(console.log(`  ${member.username} assigned to ${new_role}...`))
                .catch(console.error); // Shows error if we have a send error;
        }
    }//execute
}