const { flipCondition, checkCondition } = require("../data/database");

function shareColor(initiator, target, response) {
    let targetName = target.player.nickname === null ? target.player.user.username : target.player.nickname;
    let initiatorName = initiator.player.nickname === null ? initiator.player.user.username : initiator.player.nickname;
    
    // Block users with SHY boolean TRUE
    if (checkCondition(initiator, 'shy')) {
        initiator.player.user.send("Sorry, you are too shy to share. You have the 'shy' condition. Try seeing a Psychologist.");
        return;
    }

    target.player.user.send(`${initiatorName} has shared their color with you!\n**Color:** ${initiator.character.color}${!response ? `!\n\n if you would like to recepricate?\n📇 Share Card\n 🖌️ Share Color` : `!`}`)
        .then(sentMessage => {
            if (!response) {
                sentMessage.react('📇');
                sentMessage.react('🖌️');
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
        .then(console.log(`${initiatorName} shared their color with ${targetName}`))
        .then(initiator.player.user.send(`Your color was successfully shared with ${targetName}`)) 
    .catch(console.error);
}

function shareCard(initiator, target, response) {
    let targetName = target.player.nickname === null ? target.player.user.username : target.player.nickname;
    let initiatorName = initiator.player.nickname === null ? initiator.player.user.username : initiator.player.nickname;

    // Block users with SHY boolean TRUE
    if (checkCondition(initiator, 'shy')) {
        initiator.player.user.send("Sorry, you are too shy to share. You have the 'shy' condition. Try seeing a Psychologist.");
        return;
    }

    if (checkCondition(initiator,'coy')) {
        initiator.player.user.send("That's not very coy... try sharing your color instead! You have the 'Coy' condition seeing a Psychologist could also help.");
        return;
    };

    target.player.user.send(`${initiatorName} has shared their card with you!\n**Role:** ${initiator.character.name}\n**Color:** ${initiator.character.color}${!response ? `!\n\n if you would like to recepricate?\n📇 Share Card\n 🖌️ Share Color` : `!`}`)
        .then(sentMessage => {
            if (!response) {
                sentMessage.react('📇');
                sentMessage.react('🖌️');
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
        .then(console.log(`${initiatorName} shared their card with ${targetName}`))
        .then(initiator.player.user.send(`Your card was successfully shared with ${targetName}`))
        .then(() => {
            if (initiator.character.name == "Red Psychologist" || initiator.character.name == "Blue Psychologist") {
                console.log(`${initiatorName} is conducting counsling...`);
                if (target.character.coy) flipCondition(target, 'coy');
                if (target.character.shy) flipCondition(target, 'shy');
            }
        })        
    .catch(console.error); // End send
}

module.exports = { shareColor, shareCard }