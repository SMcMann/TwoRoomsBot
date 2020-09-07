const format = require('../scripts/formatting')
const winConditions = require("../data/winConditions.json");
const importChars = require("../data/characters.json");
const importSpecial = require("../data/specialroles.json");
const avatar = 'https://scontent.fsac1-2.fna.fbcdn.net/v/t1.0-9/117854855_3357840704261597_5605760858299843730_o.png?_nc_cat=102&_nc_sid=09cbfe&_nc_ohc=qDELSZGVMKsAX_vrV_P&_nc_ht=scontent.fsac1-2.fna&oh=fdd55030c3a4d47eeb3471893e9547e2&oe=5F7AB71B'
const { channels } = require('./serverValues');
let database = [];
let goals = [...winConditions];
let characters = [...importChars,...importSpecial];

let live = false;

function findPlayerByCharacter(character) {
    if (database.length > 0 && character !== null) {
        for (let record of database) {
            if (record.character.name == character) {
                return record;
            }
        }
    }
    return undefined;
}

function findPlayer (payload) {
    if (database.length > 0 && payload !== null) {
        let player = undefined;
        for (let record of database) {
            if (record.player.nickname !== null && record.player.nickname.toLowerCase() === payload.toLowerCase()) {
                player = record;
                return player;
            } else if (record.player.user.username.toLowerCase() === payload.toLowerCase()) {
                player = record;
                return player;
            }
        }
    } else {
        return undefined;
    }

}

function addToDB (payload) {
    database.push(payload);
}

function clearDB () {
    database.length = 0;
}

function gameReport() {
    let playerReport = '';
    let goalReport = '';
    let redCount = 0;
    let blueCount = 0;
    let grayCount = 0;
    let groupCount = 0;

    for (let goal of goals) {
        if (groupCount > 0) goalReport = `${goalReport}\n`
        let { group, conditions } = goal;
        /*let alignment;
        group === 'Red' ? alignment = '🟥' : 
            group === 'Blue' ? alignment = '🟦' :
                alignment = '⬜';*/
        let goalColor = ""; //
        if (group === "Red") goalColor = "Red:";
        else if (group === "Blue") goalColor = "Blue:";
        else goalColor = "Gray:";

        let colorAdded = false;
        for (let condition of conditions) {
            if (condition.active) {
                if (!colorAdded) {
                    goalReport = `${goalReport} ${goalColor}`;
                    colorAdded = true;
                }
                goalReport = `${goalReport} [${format.addCheckmark(condition.status)} ${condition.name}]`
            }
        }
        groupCount++
    }

    let reportEmbed = {
        color: 0x0099ff,
        title: 'Two Rooms & Boom - Game Report',
        author: {
            name: 'Test Author',
            icon_url: avatar,
        },
        description: '',
        fields: [],
        timestamp: new Date(),
        footer: {
            text: `What team won???`,
            icon_url: avatar,
        },
    };

    // For Loop constructs current player base
    for (let item of database) {
        let {player, character, currChannel, leader} = item;
        let alignment
        if (character.alignment === 'Red') { redCount++; alignment = '🟥'; };
        if (character.alignment === 'Blue') { blueCount++; alignment = '🟦'; };
        if (character.alignment === 'Gray') { grayCount++; alignment = '⬜'; };
        let roomNum;
        if (currChannel == channels.room1) roomNum = ':one:';
        if (currChannel == channels.room2) roomNum = ':two:';

        player.nickname !== null ? playerReport = `${playerReport} **Nickname:** ${player.nickname}\n` : playerReport = `${playerReport}\n`;

        reportEmbed.fields.push({ 
            name: `${alignment} ${character.name} | Room: ${roomNum}${leader ? '👑' : ''}`, 
            value: `**Player:** ${player.user.username} | **Nickname:** ${player.nickname !== null ? `${player.nickname}` : 'None'}`
        })
    }

    let report = `Player Count: ${database.length} | Blue: ${blueCount} | Red: ${redCount} | Gray: ${grayCount}`; // Makes player count report
    reportEmbed.description = `${report}\n${goalReport}` // Adds goal repor
    // report = `${report}\n\n${playerReport}`; // Adds player report

    return reportEmbed;
}

function flipCondition(target, condition) {
    let index = database. findIndex(el => el.player.user.id === target.player.id);
    let currentUser = database.find(el => el.player.id === target.player.id);
    currentUser.character[condition] = !currentUser.character[condition]
    target.player.user.send(`You are ${currentUser.character[condition] === true ? condition : `no longer ${condition}`}!`);
    database[index] = currentUser;
    console.log(`The ${currentUser.character.name.toLowerCase()} is ${currentUser.character[condition] === true ? condition : `not ${condition}`}!`);
    return;
}

function checkCondition(target, condition) {
    let currentUser = database.find(el => el.player.id === target.player.id);
    console.log(`Checking ${currentUser.player.user.username} for the ${condition} flag`);
    return currentUser.character[condition]
}

function updateGoal(character,parameter,value) {
    //Iterate through goals
    for (let g of goals) {
        //Iterate through that goal's conditions
        for (let c of g.conditions) {
            //If a match is found
            if (c.character == character) {
                //Update the status/active
                c[parameter] = value;
                console.log(`${c.name} ${parameter} updated to ${value}.`);
                return;
            }
        }
    }
}

function getGoal(character) {
    //Iterate through goals
    for (let g of goals) {
        //Iterate through that goal's conditions
        for (let c of g.conditions) {
            //If a match is found
            if (c.character == character) {
                //Return that goal
                return c;
            }
        }
    }
}

function toggleCharacter(name, message) {
    for (let c of characters) {
        if (c.name === name) {
            c.active = !c.active;
            console.log(`${name} has been set to ${c.active}`);
            message.channel.send(`${name} has been set to ${c.active}`);
            break;
        }
    }
}

function checkLive() {
    return live;
}

function toggleLive(message) {
    live = !live
    if (live) message.reply('game is now live!');
    if (!live) message.reply('game has concluded...');
    return;
}

function updateLeadership(target,value) {
    let index = database.findIndex(el => el.player.user.id === target.player.id);
    let currentUser = database.find(el => el.player.id === target.player.id);
    currentUser.leader = value;
    database[index] = currentUser;
    return;
}

function updateVoice(target,value) {
    let index = database.findIndex(el => el.player.user.id === target.player.id);
    let currentUser = database.find(el => el.player.id === target.player.id);
    currentUser.currChannel = value;
    database[index] = currentUser;
    return;
}

function findLeader(room) {
    for (let entry of database) {
        if (entry.leader && entry.currChannel == room) return entry;
    }
    return undefined;
}

module.exports = { live, toggleLive, checkLive, 
    characters, toggleCharacter, checkCondition, flipCondition,
    database, addToDB, clearDB, findPlayer, findPlayerByCharacter, gameReport,
    updateGoal, getGoal,
    updateLeadership, updateVoice, findLeader };