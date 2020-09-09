const avatar = 'https://scontent.fsac1-2.fna.fbcdn.net/v/t1.0-9/117854855_3357840704261597_5605760858299843730_o.png?_nc_cat=102&_nc_sid=09cbfe&_nc_ohc=qDELSZGVMKsAX_vrV_P&_nc_ht=scontent.fsac1-2.fna&oh=fdd55030c3a4d47eeb3471893e9547e2&oe=5F7AB71B'
const president = 'https://cdn.discordapp.com/attachments/749887204914102322/752305040525623326/president.png';
const bomber = 'https://cdn.discordapp.com/attachments/749887204914102322/752305020032254073/bomber.png';
const doctor = 'https://cdn.discordapp.com/attachments/749887204914102322/752312155277230290/doctor.png';
const engineer = 'https://cdn.discordapp.com/attachments/749887204914102322/752312178966528080/engineer.png';
const redspy = 'https://cdn.discordapp.com/attachments/749887204914102322/752312530357059605/spy_r.png';
const bluespy = 'https://cdn.discordapp.com/attachments/749887204914102322/752312456084193301/spy_b.png';
const bluecoyboy = 'https://cdn.discordapp.com/attachments/749887204914102322/752304749986054274/blue.png';
const redcoyboy = 'https://cdn.discordapp.com/attachments/749887204914102322/752304911638593596/red.png';
const blueshyguy = 'https://cdn.discordapp.com/attachments/749887204914102322/752311941413863445/shy_guy_b.png';
const redshyguy = 'https://cdn.discordapp.com/attachments/749887204914102322/752311943313752075/shy_guy_r.png';
const redpsychologist = 'https://cdn.discordapp.com/attachments/749887204914102322/752311189958164480/psycologist_r.png';
const bluepsychologist = 'https://cdn.discordapp.com/attachments/749887204914102322/752311014233604146/psycologist_b.png';
const gambler = 'https://cdn.discordapp.com/attachments/749887204914102322/752311421089611876/gambler.png'
const decoy = 'https://cdn.discordapp.com/attachments/749887204914102322/752311714963259451/target.png';
const sniper = 'https://cdn.discordapp.com/attachments/749887204914102322/752311686278676580/sniper.png'
const blueteam = 'https://cdn.discordapp.com/attachments/749887204914102322/752304749986054274/blue.png';
const redteam = 'https://cdn.discordapp.com/attachments/749887204914102322/752304911638593596/red.png';

const cards = { president, bomber, doctor, engineer, redspy, bluespy, bluecoyboy, redcoyboy, blueshyguy, redshyguy, redpsychologist, bluepsychologist, gambler, decoy, sniper, blueteam, redteam };

function getCard(character, share) {
    // Creates the embed for the card
    let cardEmbed = {
        color: character.color === 'Red' ? 0xFF0000 : character.color === 'Blue' ? 0x0099ff : 0x808080,
        title: `${share ? `The ${character.name} Card was revealed to you!` : `You have been dealt the ${character.name} Card!`}`,
        author: {
            name: 'Two Rooms Bot',
            icon_url: avatar,
        },
        description: `**Share Color:** ${character.color}\n**Team:** ${character.alignment === 'Gray' ? 'None' : `${character.alignment} Team`}`,
        fields: [
            {
                name: `${character.name} Rules`,
                value: `${character.rules}`,
            }
        ],
        image: {
            url: cards[character.name.toLowerCase().replace(/\s+/g, '')],
        },
        timestamp: new Date(),
        footer: {
            text: `Good luck, ${character.alignment === 'Gray' ? `may you achive your goals!` : `may fortune favor the ${character.alignment}!`}`,
            icon_url: avatar,
        },
    };

    return cardEmbed;
}

module.exports = { getCard }