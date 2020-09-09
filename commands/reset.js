const { clearDB, live, checkLive, toggleLive, resetRound }= require("../data/database");
//const server = require("../data/server.json");
const { roles } = require("../data/serverValues");
const { resetRoles } = require("../scripts/resetting");

module.exports = {
    name: 'reset', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: ['end', 'refresh', 'resetting'],
    cooldown: 0,
    description: 'Reset assignment database, as well as Red Team/Blue Team/Gray Team roles',
    args: false, 
    execute(message, args){
        if (message.channel.type === 'dm') {
            message.reply(`The !reset command must be done on server by an admin.`)            
            return;
        }

        message.delete({ timeout: 500 })

        if (!message.member.roles.cache.some(el => el.name === roles.admin)) {
            message.reply('Only an admin can use this command.')
                .then(sentMessage => {
                    sentMessage.delete({ timeout: 5000 })
                });
            return;
        }
        
        clearDB();  //Reset database
        /*if (!checkLive()) {
            message.reply('No game is active, you need to make a game to reset it!');
            return;
        } */  
        resetRoles(message);

       
        
        //Reset round counter
        resetRound();
        if (checkLive()) toggleLive(message);
        message.reply('the game is fully reset!')
    }//execute
}