const { getRoundStatus, startRound, timeRemaining } = require("../scripts/gameClock");
const { checkLive } = require("../data/database");

const one = ['one', '1'];
const two = ['two', '2'];
const three = ['three', '3'];
const four = ['four', '4'];
const five = ['five', '5'];
const options = [...one, ...two, ...three, ...four];

module.exports = {
    name: 'round', //THIS MUST BE THE SAME NAME OF THE FILE/COMMAND
    aliases: [],
    cooldown: 0,
    description: 'Works with the round timers.',
    args: true, 
    execute(message, args){
        if (message.channel.type !== 'dm') message.delete({ timeout: 500 });
        
        if (!checkLive()) {
            message.channel.send('No game is live!');
            return;
        }

        if (args[0] === 'start' && args.length > 1 && options.some(el => el === args[1])) {
            if (getRoundStatus()) message.channel.send(`Round is already live: ${timeRemaining()}`)
            one.some(el => el === args[1].toLowerCase()) ? startRound(1) :
                two.some(el => el === args[1].toLowerCase()) ? startRound(2) :
                    three.some(el => el === args[1].toLowerCase()) ? startRound(3) :
                        four.some(el => el === args[1].toLowerCase()) ? startRound(4) :
                            five.some(el => el === args[1].toLowerCase()) ? startRound(5) :
                                message.channel.send(`${args} is not a valid time for the round.`)
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