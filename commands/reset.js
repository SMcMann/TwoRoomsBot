const { clearDB, live, checkLive, toggleLive }= require("../data/database");
//const server = require("../data/server.json");
const { roles } = require("../data/serverValues");

function removeRole(player,roleName) {
    if (player.roles.cache.some(r => r.name == roleName)) {
        player.roles.remove(player.guild.roles.cache.filter(r => r.name == roleName));
    }
}

module.exports = {
    name: 'reset', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['end'],
    cooldown: 0,
    description: 'Reset assignment database, as well as Red Team/Blue Team/Gray Team roles',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') return;
        /*if (!checkLive()) {
            message.reply('No game is active, you need to make a game to reset it!');
            return;
        } */  
        message.delete({ timeout: 500 })
        
        message.reply("resetting game.")
            .then(sentMessage => {
                for (let member of sentMessage.guild.members.cache) {
                    let currMember = member[1];
                    removeRole(currMember, roles.room1);
                    removeRole(currMember, roles.room2);
                    removeRole(currMember, roles.red);
                    removeRole(currMember,roles.blue);
                    removeRole(currMember,roles.gray);
                    removeRole(currMember,roles.leader);
                }
            })
        

        //Reset database
        clearDB();
        if (checkLive()) toggleLive(message);
        message.reply('the game is fully reset!')
    }//execute
}