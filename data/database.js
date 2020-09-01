let database = [];

function findPlayer (payload) {
    if (database.length > 0) {
        let player = database.find(el => el.player.user.username === payload || el.player.nickname === payload);
        return player;
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

module.exports = {database, addToDB, clearDB, findPlayer};