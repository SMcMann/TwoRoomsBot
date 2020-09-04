
//const server = require("../data/server.json");
const { roles, getRole }  = require("../data/serverValues");
const { database, checkLive, characters, checkCondition, flipCondition, getGoal, updateGoal, findPlayerByCharacter } = require("../data/database");


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

        let presGoal = getGoal("President");
        let docGoal = getGoal("Doctor");
        let bombGoal = getGoal("Bomber");
        let engGoal = getGoal("Engineer");
        //Gambler end of game action
        let gambleGoal = getGoal("Gambler");
        let gamblePromise = false;
        if (gambleGoal.active) {
            gamblePromise = new Promise(resolve => {
                const gambler = findPlayerByCharacter("Gambler").player;
                //message.channel.send(`<@${gambler.user.id}>, who do you think is going to win?`+
                message.channel.send(`Gambler ${gambler.user.username}, who do you think is going to win?`+
                    "\n 🟦 - Blue Team" + "\n 🟥 - Red Team" + "\n ⬜ - Neither")
                    .then(sentMessage => {
                        sentMessage.react('🟦');
                        sentMessage.react('🟥');
                        sentMessage.react('⬜');
                        //const filter = (reaction,user) => user.id === gambler.user.id;
                        const filter = (reaction,user) => true;
                        const collector = sentMessage.createReactionCollector(filter, { max: 1 });
                        collector.on('collect', r => {
                            if (r.emoji.name === '🟦') {
                                updateGoal("Gambler","value","Blue");
                            }
                            if (r.emoji.name === '🟥') {
                                updateGoal("Gambler","value","Red");
                            }
                            if (r.emoji.name === '⬜') {
                                updateGoal("Gambler","value","Gray");
                            }
                            //Update varible
                            gambleGoal = getGoal("Gambler");
                        });
                    })
                    .catch(console.error);
                resolve("Gambled");
            });
        } else {
            gamblePromise = new Promise(resolve => resolve("No gambler"));
        }

        //Sniper end of game action
        let sniperPromise = new Promise(resolve => resolve("No sniper"));

        //Bomb explosion
        function bombFunc () {
            console.log("Exploding the bomb");
            //if (!engGoal.active || engGoal.status) {
            if (true) {
                const bomber = findPlayerByCharacter("Bomber");
                for (let p of database) {
                    if (p.currChannel == bomber.currChannel) {
                        flipCondition(p,"dead");
                    }
                }
            }
        }
        let bombPromise = new Promise(resolve => {
            resolve(bombFunc);
        });


        //Check all win cons
        let winConPromise = new Promise(resolve => {
            //President/Bomber
            if (checkCondition(findPlayerByCharacter("President"),"dead")) {
                updateGoal("President","status",false);
                updateGoal("Bomber","status",true);
                //Update varibles
                presGoal = getGoal("President");
                bombGoal = getGoal("Bomber");
            }

            //Gambler
            if (gambleGoal.active) {
                let gambleStatus;
                if (gambleGoal.value == "Blue") {
                    //Check if Blue team won
                    if (presGoal) {
                        //The president is alive at the end of the game
                        if (docGoal.active) {
                            //Did the president meet with the Doctor
                            if (docGoal.status) {
                                //Yes - Blue wins
                                gambleStatus = true;
                            } else {
                                //No - Blue loses
                                gambleStatus = false;
                            }
                        } else {
                            //No doc - Blue wins
                            gambleStatus = true;
                        }
                    } else {
                        //Pres dead - Blue loses
                        gambleStatus = false;
                    }
                } else if (gambleGoal.value == "Red") {
                    //Check if Red team won
                    if (bombGoal) {
                        //The president is dead at the end of the game
                        if (engGoal.active) {
                            //Did the bomber meet with the Engineer
                            if (engGoal.status) {
                                //Yes - Red wins
                                gambleStatus = true;
                            } else {
                                //No - Red loses
                                gambleStatus = false;
                            }
                        } else {
                            //No Eng - Red wins
                            gambleStatus = true;
                        }
                    } else {
                        //Pres lives - Red loses
                        gambleStatus = false;
                    }
                } else {
                    //Did neither team win?
                    if ((presGoal.status && docGoal.active && !docGoal.status) 
                        || (bombGoal.status && engGoal.status && engGoal.status)) {
                        gambleStatus = true;
                    } else gambleStatus = false;
                }
                updateGoal("Gambler","status",gambleStatus);
                //Update variable
                gambleGoal = getGoal("Gambler");
            }
            resolve("Win Cons");
        });

        //Reveal colors

        gamblePromise
            .then(sniperPromise)
            .then(bombPromise)
            .then(winConPromise)
            .catch(console.error);

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