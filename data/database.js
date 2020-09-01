let database = [];

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

module.exports = {database, addToDB, editDB, clearDB, findPlayer};