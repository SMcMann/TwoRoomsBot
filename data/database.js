const winConditions = require("../data/winConditions.json");
const importChars = require("../data/characters.json");
const importSpecial = require("../data/specialroles.json");
const { addCheckmark } = require('../scripts/formatting');
const avatar = 'https://scontent.fsac1-2.fna.fbcdn.net/v/t1.0-9/117854855_3357840704261597_5605760858299843730_o.png?_nc_cat=102&_nc_sid=09cbfe&_nc_ohc=qDELSZGVMKsAX_vrV_P&_nc_ht=scontent.fsac1-2.fna&oh=fdd55030c3a4d47eeb3471893e9547e2&oe=5F7AB71B'
const { channels } = require('./serverValues');
const { getRooms } = require("../scripts/client");

let database = [];
let goals = [...winConditions];
let characters = [...importChars,...importSpecial];
let debrief = false;

let live = false;

let roundCount = 0;
let gameCount = 0;

function incrementRound() {
    roundCount++;
}

function getRound() {
    return roundCount;
}

function getGameCount() {
    return gameCount;
}

function incrementGame() {
    gameCount++;
}

function resetRound() {
    roundCount = 0;
}

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
    console.log('Clearing Database...');
    database.length = 0;
    characters = [...importChars,...importSpecial];
    debrief = false;

    for (let g of goals) {
        for (c of g.conditions) {
            c.active = false;
            c.status = false;
            if (c.character === 'President') c.status = true;
            if (c.character == "Traveler") c.value = 0;
            else g.value = "";

        }
    }
    return;
    // for (let c of characters) {
    //     c.dead = false;
    //     if (c.name == "Red Shyguy" || c.name == "Blue Shyguy") c.shy = true;
    //     if (c.name == "Red Coyboy" || c.name == "Blue Coyboy") c.coy = true;
    // }

}

function getDB() {
    return database;
}

function getDebrief() {
    return debrief;
}

function toggleDebrief() {
    debrief = !debrief;
    console.log(`Debrief set to ${debrief}`);
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
        let goalColor = `**${group}:**`;
        /*if (group === "Red") goalColor = "Red:";
        else if (group === "Blue") goalColor = "Blue:";
        else goalColor = "Gray:";*/

        let groupWin = true;
        let groupActive = false;
        let currReport = "";
        for (let condition of conditions) {
            if (condition.active) {
                groupActive = true;
                if (!condition.status) groupWin = false;
                currReport = `${currReport} [${addCheckmark(condition.status)} ${condition.name}]`;
            }
        }
        if (groupActive) {
            if (groupWin && debrief) currReport = `:crown: ${currReport}`;
            currReport = `${goalColor} ${currReport}`;
            goalReport = `${goalReport} ${currReport}`;
        }
        groupCount++
    }

    let reportEmbed = {
        color: 0x0099ff,
        title: `Two Rooms & Boom - Game ${gameCount} Report`,
        author: {
            name: '2R1B Bot',
            icon_url: avatar,
        },
        description: '',
        fields: [],
        timestamp: new Date(),
        footer: {
            text: `Game ${gameCount} game report - Hope you all had fun!`,
            icon_url: avatar,
        },
    };

    // For Loop constructs current player base
    for (let item of database) {
        let {player, character, currChannel, leader} = item;
        console.log(`${character.name} dead condition: ${character.dead}`);
        let alignment
        if (character.alignment === 'Red') { redCount++; alignment = '🟥'; };
        if (character.alignment === 'Blue') { blueCount++; alignment = '🟦'; };
        if (character.alignment === 'Gray') { grayCount++; alignment = '⬜'; };
        let roomNum;
        if (currChannel == channels.room1) roomNum = `${live ? ':one:' : ':two:'}`;
        if (currChannel == channels.room2) roomNum = `${live ? ':two:' : ':one:'}`;

        player.nickname !== null ? playerReport = `${playerReport} **Nickname:** ${player.nickname}\n` : playerReport = `${playerReport}\n`;

        reportEmbed.fields.push({ 
            name: `${alignment} ${character.name} | Room: ${roomNum}${leader ? '👑' : ''}${character.dead ? '💀' : ''}`, 
            value: `**Player:** ${player.user.username} | **Nickname:** ${player.nickname !== null ? `${player.nickname}` : 'None'}`
        })
    }

    let report = `Player Count: ${database.length} | Blue: ${blueCount} | Red: ${redCount} | Gray: ${grayCount}`; // Makes player count report
    reportEmbed.description = `${report}\n${goalReport}` // Adds goal report

    return reportEmbed;
}

function characterReport(all) {
    let roleEmbed = {
        color: 0x0099ff,
        title: 'Two Rooms & Boom - Active Role Report',
        author: {
            name: 'Two Rooms Bot',
            icon_url: avatar,
        },
        description: `${all ? 'This is a list of all the roles availible to the bot and their current status for the next game.' : `This is a list of the ACTIVE roles for the next game.`}`,
        fields: [],
        timestamp: new Date(),
        footer: {
            text: `If this report needs adjustment, contract John Cleveland`,
            icon_url: avatar,
        },
    };

    for (role of characters) {
        let field = {
            name: `${addCheckmark(role.active)} ${role.name} | Color: ${role.color === 'Red' ? '🟥' : role.color === 'Blue' ? '🟦' : '⬜'} ${role.alignment === 'Red' ? '| Alignment: 🟥' : role.alignment === 'Blue' ? '| Alignment: 🟦' : ''}`,
            value: `**Rules:** ${role.rules}`
        }
        if (role.active) roleEmbed.fields.push(field); // Push to the report if the role is active
        if (!role.active && all) roleEmbed.fields.push(field); // Push to the report only if they have requested all roles
    }

    return roleEmbed
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
    console.log(`Updating ${target.player.user.username}'s currChannel to ${value}`)
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

function clone(object) {
    let newClone = {};
    for (let [key, value] of Object.entries(object)) {
        newClone[key] = value;
    }
    return newClone;
}

function kill(target) {
    let rooms = getRooms();
    let index = database.findIndex(el => el.player.user.id === target.player.user.id);
    let currentUser = database[index];
    currentUser.character.dead = true;
    console.log(`${currentUser.character.name} ${currentUser.player.user.username} died...`);
    rooms.lobby.send(`${currentUser.character.name} ${currentUser.player.user.username} died...`);
    target.player.user.send(`You got blown up... you are dead!`);
}

module.exports = { live, toggleLive, checkLive, getGameCount, incrementGame,
    characters, toggleCharacter, checkCondition, flipCondition,
    database, addToDB, clearDB, findPlayer, findPlayerByCharacter, gameReport, characterReport,
    updateGoal, getGoal, getDB, toggleDebrief, getDebrief, kill,
    updateLeadership, updateVoice, findLeader, clone, 
    incrementRound, getRound, resetRound };