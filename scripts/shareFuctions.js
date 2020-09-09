const { flipCondition, checkCondition, updateGoal, getDB } = require("../data/database");
const { getCard } = require("../image/cards");

function shareColor(initiator, target, response) {
    let targetName = target.player.nickname === null ? target.player.user.username : target.player.nickname;
    let initiatorName = initiator.player.nickname === null ? initiator.player.user.username : initiator.player.nickname;

    if (getDB().length <= 10) {
        initiator.player.user.send("Sorry, this game has less then 10 players. You can only show your CARD with other players. If you would like to show your card hit the 📇 reaction!")
            .then(sentMessage => {
                sentMessage.react('📇');
                const filter = (reaction, user) => user.id === initiator.player.id 
                const collector = sentMessage.createReactionCollector(filter, { time: 600000, max: 2 });
                collector.on('collect', r => {
                    if (r.emoji.name === '📇') {
                        shareCard(initiator, target, true);
                    }
                }) // End collector
            })
            .catch(console.error);
        return;
    }
    
    // Block users with SHY boolean TRUE
    if (checkCondition(initiator, 'shy')) {
        initiator.player.user.send("Sorry, you are too shy to show your color. You have the 'shy' condition. Try seeing a Psychologist.");
        return;
    }

    target.player.user.send(`${initiatorName} has showed their color with you!\n**Color:** ${initiator.character.color}${!response ? `!\n\n if you would like to recepricate?\n📇 Share Card\n 🖌️ Share Color` : `!`}`)
        .then(sentMessage => {
            if (!response) {
                sentMessage.react('📇');
                if (database.length >= 10) sentMessage.react('🖌️');
                const filter = (reaction, user) => user.id === target.player.id// 
                const collector = sentMessage.createReactionCollector(filter, { time: 600000, max: 2 });
                collector.on('collect', r => {
                    if (r.emoji.name === '🖌️') {
                        shareColor(target, initiator, true);
                    }
                    if (r.emoji.name === '📇') {
                        shareCard(target, initiator, true);
                    }
                }) // End collector
            } // End Response
        }) // End Reaction listner
        .then(console.log(`${initiatorName} showed their color with ${targetName}`))
    
}

function shareCard(initiator, target, response) {
    let targetName = target.player.nickname === null ? target.player.user.username : target.player.nickname;
    let initiatorName = initiator.player.nickname === null ? initiator.player.user.username : initiator.player.nickname;

    //psychCheck is true when the initiator was just shown a psychologist card
    let psychCheck = (target.character.name == "Red Psychologist" || target.character.name == "Blue Psychologist") && response;

    // Block users with SHY boolean TRUE
    if (!psychCheck && checkCondition(initiator, 'shy')) {
        initiator.player.user.send("Sorry, you are too shy to share. You have the 'shy' condition. Try seeing a Psychologist.");
        return;
    }

    if (!psychCheck && checkCondition(initiator,'coy')) {
        initiator.player.user.send("That's not very coy... try showing your color instead! You have the 'Coy' condition seeing a Psychologist could also help.");
        return;
    };

    //crimCheck is true when the initiator is a criminal who is a) sharing with someone, or b) responding to a reveal
    let crimCheck = (initiator.character.name == "Red Criminal" || initiator.character.name == "Blue Criminal") && response;

    //thugCheck is true when the initiator is a thug who is a) sharing with someone, or b) responding to a reveal
    let thugCheck = (initiator.character.name == "Red Thug" || initiator.character.name == "Blue Thug") && response;

    target.player.user.send(`${initiatorName} has exposed their card to you${!response ? `!\n\n if you would like to recepricate?\n📇 Share Card\n 🖌️ Share Color` : `!`}`, { embed: getCard(initiator.character, true) })
        .then(sentMessage => {
            if (!response) {
                sentMessage.react('📇');
                if (getDB().length >= 10) sentMessage.react('🖌️');
                const filter = (reaction, user) => user.id === target.player.id;
                const collector = sentMessage.createReactionCollector(filter, { time: 600000, max: 2 });
                collector.on('collect', r => {
                    if (r.emoji.name === '🖌️') {
                        shareColor(target, initiator, true);
                    }
                    if (r.emoji.name === '📇') {
                        shareCard(target, initiator, true);
                    }
                }) // End collector
            } // End Response
        }) // End Reaction listner
        .then(console.log(`${initiatorName} exposed their card to ${targetName}`))
        .then(initiator.player.user.send(`Your card was successfully exposed to ${targetName}`))
        .then(() => {
            //Check card interractions
            if ((initiator.character.name == "President" && target.character.name == "Doctor")
                || (target.character.name == "President" && initiator.character.name == "Doctor")) {
                updateGoal("Doctor","status",true);
            }
            if ((initiator.character.name == "Bomber" && target.character.name == "Engineer")
                || (target.character.name == "Bomber" && initiator.character.name == "Engineer")) {
                updateGoal("Engineer","status",true);
            }
            if (psychCheck) {
                console.log(`${initiatorName} is responding to counsling...`);
                if (initiator.character.coy) flipCondition(initiator, 'coy');
                if (initiator.character.shy) flipCondition(initiator, 'shy');
            }
            if (crimCheck) {
                console.log(`${targetName} is spooked by the criminal ${initiatorName}`);
                if (!target.character.shy) flipCondition(target, 'shy');
            }
            if (thugCheck) {
                console.log(`${targetName} is intimidated by the thug ${initiatorName}`);
                if (!target.character.coy) flipCondition(target, 'coy');
            }
        })        
    .catch(console.error); // End send
}

module.exports = { shareColor, shareCard }