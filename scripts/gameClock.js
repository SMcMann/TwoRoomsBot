const { incrementRound, getRound } = require("../data/database");
const { broadcast } = require("./broadcast");
const { getRooms } = require("./client");

let min = 0; // Starting minutes on master game clock
let sec = 0; // Starting seconds on master game clock
let deadline // Deadline for the round
let currentTime = Date.parse(new Date()); // Current Computer Date

let roundLive = false;
let roundPaused = false;

let pause; // Placeholder for pause reoccuring event.
let roundTimer; // Placeholder for current timer iteration

function timeRemaining() {
    updateTime();
    let minRemaining = `${min >= 1 ? `${min} ${min > 1 ? 'minute' : 'minutes'} and ` : ''}`;
    let secRemaining = `${sec > 0 ? `${sec} ${sec === 1 ? 'second' : 'seconds'}` : ''}`;
    sec <= 0 && min <= 0 ? res = `Round Over` : res = `${minRemaining}${secRemaining} remianing`; 
    return res;
}

function updateTime() {
    let t = Date.parse(deadline) - Date.parse(new Date());
    sec = Math.floor( (t/1000) % 60 );
    min = Math.floor( (t/1000/60) % 60 );
    return;
}

function pauseRound() {
    let rooms = getRooms()
    rooms.lobby.send('Game is paused');
    pause = setInterval(keepPaused, 1000);
};

function unpauseRound() {
    let rooms = getRooms()
    updateTime();
    rooms.lobby.send('Game is unpaused!');
    clearInterval(pauseRound);
};

function keepPaused() {
    deadline = new Date(currentTime + (sec * 1000) + (min * 1000 * 60));
    return;
};

function minuteWarning() {
    updateTime();
    if (sec === 0) { 
        console.log(`${min} ${min === 1 ? 'minute' : 'minutes'} remianing`);
        broadcast(`${min} ${min === 1 ? 'minute' : 'minutes'} remianing`);
    }
    if (min < 1) {
        clearInterval(roundTimer);
        roundTimer = setInterval(secondWarning, 1000);
    }
}

function secondWarning() {
    updateTime();
    if (sec === 30) {
        console.log(`${sec} seconds remaining`);
        broadcast(`${sec} seconds remaining`);
    }
    if (sec === 10) {
        console.log(`${sec} seconds remaining`);
        broadcast(`${sec} seconds remaining`);
    };
    if (sec === 5) {
        console.log(`${sec} seconds remaining`);
        broadcast(`${sec} seconds remaining`);
    };
    if (sec <= 0 && roundLive) {
        let roundNum = getRound();
        roundLive = false;
        console.log(`[- Round ${roundNum} has ended! -]`);
        broadcast(`**[- Round ${roundNum} has ended -]**`);
        clearInterval(roundTimer);
        sec = 0;
        min = 0;
    }
}

function startRound(minutes) {
    incrementRound();
    min = minutes;
    let roundNum = getRound();
    roundLive = true;
    console.log(`${min} minute round has begun...`);
    broadcast(`**[- Round ${roundNum} has begun -]**`);
    currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + (sec * 1000) + (min * 1000 * 60));
    minuteWarning();
    roundTimer = setInterval(minuteWarning, 1000)
}

function getRoundStatus() {
    return roundLive;
}

module.exports = { startRound, pauseRound, unpauseRound, timeRemaining, getRoundStatus };