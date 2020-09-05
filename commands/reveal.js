const { checkLive, getGoal, updateGoal, findPlayerByCharacter } = require("../data/database");
const { sniperFunc } = require("../scripts/endgame");

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

        console.log("Starting reset...\nChecking win conditions.");

        //Initiate all win con checks (starting with Gambler)
        let gambleGoal = getGoal("Gambler");
        message.reply(`Calculating final results...`)
        if (gambleGoal.active) { 
            const gambler = findPlayerByCharacter("Gambler").player;
            //message.channel.send(`<@${gambler.user.id}>, who do you think is going to win?`+
            message.channel.send(`Gambler ${gambler.user.username}, who do you think is going to win?`+ "\n 🟦 - Blue Team" + "\n 🟥 - Red Team" + "\n ⬜ - Neither")
            .then(sentMessage => {
                sentMessage.react('🟦');
                sentMessage.react('🟥');
                sentMessage.react('⬜');
                //const filter = (reaction,user) => user.id === gambler.user.id;
                const filter = (reaction,user) => !user.bot;
                const collector = sentMessage.createReactionCollector(filter, { max: 1 });
                collector.on('collect', r => {
                    if (r.emoji.name === '🟦') updateGoal("Gambler","value","Blue");
                    if (r.emoji.name === '🟥') updateGoal("Gambler","value","Red");
                    if (r.emoji.name === '⬜') updateGoal("Gambler","value","Gray");
                    sniperFunc(message);
                });
            })
            .catch(console.error);
        } else {
            sniperFunc(message);
        }
    }//execute
}