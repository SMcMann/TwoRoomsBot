let database = [];

function addToDB (payload) {
    database.push(payload);
}

function clearDB () {
    database.length = 0;
}

module.exports = {database, addToDB, clearDB};