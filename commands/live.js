const { checkLive } = require("../data/database");

module.exports = {
    name: 'live', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'Checks if the game is currently live.',
    args: false, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 500 })
        if (checkLive()) message.reply(`The game is live ✅`);
        if (!checkLive()) message.reply(`The game is not live ⛔`);
    }//execute
}