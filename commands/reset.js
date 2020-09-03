const assignments = require("../data/database");
//const server = require("../data/server.json");
const { roles } = require("../data/serverValues");

function removeRole (player,roleName) {
    let removal = new Promise(resolve => {
        if (player.roles.cache.some(r => r.name == roleName)) {
            player.roles.remove(player.guild.roles.cache.filter(r => r.name == roleName));
        }
        resolve("Removed");//Idk?
    })
    return removal;
}

module.exports = {
    name: 'reset', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['end'],
    cooldown: 0,
    description: 'Reset assignment database, as well as Red Team/Blue Team/Gray Team roles',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        if (!live) message.reply('No game is active, you need to make a game to reset it!');
        message.delete({ timeout: 500 })
        //Reset roles
        for (let member of message.guild.members.cache) {
            let currMember = member[1];
            removeRole(currMember,server.roles.red)
                .then(removeRole(currMember,roles.blue))
                .then(removeRole(currMember,roles.gray))
                .then(removeRole(currMember,roles.leader))
                .catch(console.error);
        }

        //Reset database
        assignments.clearDB();
        message.reply('the game is fully reset!')
    }//execute
}