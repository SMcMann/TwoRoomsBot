const { getRoundStatus, startRound, timeRemaining, pauseRound, unpauseRound } = require("../scripts/gameClock");
const { checkLive } = require("../data/database");
const { roles } = require("../data/serverValues");

const one = ['one', '1'];
const two = ['two', '2'];
const three = ['three', '3'];
const four = ['four', '4'];
const five = ['five', '5'];
const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

module.exports = {
    name: 'round', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'Works with the round timers.',
    args: true, 
    execute(message, args){
        if (message.channel.type === 'dm') {
            message.reply(`The !round command must be done on server by an admin.`)            
            return;
        }

        message.delete({ timeout: 500 });

        if (!message.member.roles.cache.some(el => el.name === roles.admin)) {
            message.reply('Only an admin can use this command.')
                .then(sentMessage => {
                    sentMessage.delete({ timeout: 5000 })
                });
            return;
        }


        if (!checkLive()) {
            message.channel.send('No game is live!');
            return;
        }

        if (args[0] === 'pause') {
            pauseRound();
        }

        if (args[0] === 'unpause') {
            unpauseRound()
        }
        
        if (args[0] === 'start' && args.length > 1 && options.some(el => el === parseInt(args[1]))) {
            if (getRoundStatus()) message.channel.send(`Round is already live: ${timeRemaining()}`)
            startRound(parseInt(args[1].toLowerCase()));
        };

        if (args[0] === 'time') {
            if (!getRoundStatus()) {
                message.channel.send('Round is not active')
                return;
            };
            message.channel.send(`${timeRemaining()}`);
        };
    }
}