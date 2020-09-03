function getUserFromArgs(args) {
    let user
        
    // FOR Loop recombines the username back into a string
    for (let el of args) {
        el.trim(); // Removes any whitespace on the element....
        el === args[0] ? user = el : user = `${user} ${el}` // Reconstructs string
    };

    return user;
}

module.exports = { getUserFromArgs };