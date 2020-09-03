
//const server = require("../data/server.json");
const { roles, getRole }  = require("../data/serverValues");
const { database, checkLive } = require("../data/database");


module.exports = {
    name: 'reveal', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['debrief'],
    cooldown: 0,
    description: 'Changes member roles to one of Red Team/Blue Team/Gray Team for post game discussion.',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        message.delete({ timeout: 2000 })

        if (!checkLive()) {
            message.reply('No game is active, I have nothing to reveal!');
            return;
        };

        console.log('Revealing game results!')

        for (let member of database) {
            let new_role;
            if (member.character.alignment == "Red") {
                new_role = getRole(message.guild,roles.red);
            } else if (member.character.alignment == "Blue") {
                new_role = getRole(message.guild,roles.blue);
            } else {
                new_role = getRole(message.guild,roles.gray);
            }
            member.player.roles.add(new_role)
                .then(console.log(`  ${member.player.user.username} assigned to ${member.character.alignment} team...`))
                .catch(console.error); // Shows error if we have a send error;
        }
    }//execute
}