const format = require('../scripts/formatting')
const winConditions = require("../data/winConditions.json");
const checkMarks = require("../scripts/formatting");
let database = [];
let goals = [...winConditions];

function findPlayer (payload) {
    if (database.length > 0) {
        let player = database.find(el => el.player.user.username === payload || el.player.nickname === payload);
        return player;
    } else {
        return undefined;
    }

}

function editDB (payload, target, edit) {
    //Probably inefficient
    let x;
    for (x = 0; x < database.length; x++) {
        if (database[x].player.user.username === payload || database[x].player.nickname === payload) break;
    }
    database[x][target] = edit;
    console.log(`Updated ${database[x].player.user.username}[${target}] to: ${database[x][target]}`);
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
        let { group, conditions } = goal;
        let alignment
        group === 'Red' ? alignment = '🟥' : 
            group === 'Blue' ? alignment = '🟦' :
                alignment = '⬜';
        if (groupCount > 0) goalReport = `${goalReport}\n`

        for (let condition of conditions) {
            if (condition.active) {
                goalReport = `${goalReport} ${format.addCheckmark(condition.status)} ${condition.name} [${group}]`
            }
        }
        groupCount++
    }

    // For Loop constructs current player base
    for (let item of database) {
        let {player, character} = item;
        let alignment
        if (character.alignment === 'Red') { redCount++; alignment = '🟥'; };
        if (character.alignment === 'Blue') { blueCount++; alignment = '🟦'; };
        if (character.alignment === 'Gray') { grayCount++; alignment = '⬜'; };
        playerReport = `${playerReport} ${alignment} **Role:** ${character.name.padEnd(20, ' ')} **Player:** ${player.user.username.padEnd(20, ' ')}`;
        player.nickname !== null ? playerReport = `${playerReport} **Nickname:** ${player.nickname}\n` : playerReport = `${playerReport}\n`;
    }

    let report = `**[- Two Rooms and a Boom Game report -]**`; // Makes Headers
    report = `${report}\nPlayer Count: ${database.length} | Blue: ${blueCount} | Red: ${redCount} | Gray: ${grayCount}`; // Makes player count report
    report = `${report}\n\n${goalReport}` // Adds goal repor
    report = `${report}\n\n${playerReport}`; // Adds player report

    return report;
}

module.exports = {database, addToDB, editDB, clearDB, findPlayer, gameReport};