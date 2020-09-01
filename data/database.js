let database = [];

function addToDB (payload) {
    database.push(payload);
}

function clearDB () {
    database = [];
}

module.exports = {database, addToDB, clearDB};