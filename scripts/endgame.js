const { database, findPlayerByCharacter, checkCondition, updateGoal, getGoal, flipCondition, gameReport } = require("../data/database");
const { roles, getRole } = require("../data/serverValues");
const { sniper } = require("../image/cards");

function sniperFunc(message) {
    const sniperGoal = getGoal("Sniper");
    if (sniperGoal.active) { 
        const sniper = findPlayerByCharacter("Sniper").player;
        message.channel.send(`<@${sniper.user.id}>, who do you think is going to win?`+
            "\nMention them with @")
        .then(sentMessage => {
            //const filter = (reaction,user) => user.id === sniper.user.id;
            const filter = (reaction,user) => !user.bot;
            const collector = sentMessage.channel.createMessageCollector(filter, { max: 1 });
            collector.on('collect', r => {
                updateGoal("Sniper","value",r.mentions.members.first().user.username);
                bombFunc() // We don't want to trigger until we have gotten a response!!!
                winConFunc()
                message.channel.send({embed: gameReport()})
                    .then(resetMembersFunc(message))
                    .catch(console.error);
            });
        })
        .catch(console.error);
    } else {
        bombFunc() // Blows everyone up
        winConFunc() // Checks all win conditions
        message.channel.send({embed: gameReport()})
            .then(resetMembersFunc(message))
            .catch(console.error);
    }
}

function bombFunc() {
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

function winConFunc () {
    const presGoal = getGoal("President");
    const docGoal = getGoal("Doctor");
    const bombGoal = getGoal("Bomber");
    const engGoal = getGoal("Engineer");
    const gambleGoal = getGoal("Gambler");
    const sniperGoal = getGoal("Sniper");

    //President/Bomber
    if (checkCondition(findPlayerByCharacter("President"),"dead")) {
        updateGoal("President","status",false);
        updateGoal("Bomber","status",true);
    }

    //Gambler
    if (gambleGoal.active) {
        let gambleStatus;
        if (gambleGoal.value == "Blue") gambleStatus = presGoal.status && (!docGoal.active || docGoal.status);
        if (gambleGoal.value == "Red") gambleStatus = bombGoal.status && (!engGoal.active || engGoal.status);
        if (gambleGoal.value == "Gray") gambleStatus = (presGoal.status && docGoal.active && !docGoal.status)
            || (bombGoal.status && engGoal.active && !engGoal.status);
        updateGoal("Gambler","status",gambleStatus);
    }

    //Sniper
    if (sniperGoal.active) {
        let target = findPlayerByCharacter("Target");
        let decoy = findPlayerByCharacter("Decoy");
        if (sniperGoal.value == target.user.username) updateGoal("Sniper","status",true);
        else updateGoal("Target","status",true);
        if (sniperGoal.value == decoy.user.username) updateGoal("Decoy","status",true);
    }
}

function resetMembersFunc(message) {
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
}

module.exports = { bombFunc, winConFunc, resetMembersFunc, sniperFunc }