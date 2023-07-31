require('dotenv').config();
const crypto = require('crypto');
const axios = require("axios");

async function isPasswordPwned(password){
    const hashPass = crypto.createHash('sha1').update(password).digest('hex');
    const suffix = hashPass.toUpperCase().slice(5);
    const apiUrl = `https://api.pwnedpasswords.com/range/${hashPass.toUpperCase().slice(0, 5)}`;

    try{
        const hashes = (await axios.get(apiUrl)).data.split('\n');

        for (const hash of hashes) {
            const [suf, count] = hash.split(':');
            if (suf === suffix) {
                return parseInt(count);
            }
        }

        return 0;
    } catch(error){
        console.error('Error check password in HIBP: ', error);
        return -1;
    }
}

const addFunct = {
  isPasswordPwned,
};
module.exports = addFunct;