function addCheckmark(boolean){
    let response
    boolean ? response = '✅' :
        response = ':no_entry:';
    return response;
}

module.exports = { addCheckmark }