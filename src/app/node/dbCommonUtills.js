const queries = require(`${__dirname}/static/dbCommonUtils_queries.js`);
const randomstring = require("randomstring");


async function getFamilyTreeByFHeadID(fhId, client) {
    if (fhId !== null || fhId !== undefined) {
        let result = await client.query(queries.getFamilyMembersFHid, [fhId])
        if (result.rowCount > 0)
            return result.rows
        else return [];
    }
}


function generateRandomString(length) {

    return randomstring.generate({
        length: length,
        charset: 'alphanumeric',
        readable: true,
        capitalization: 'uppercase'
    });
}

async function getRegionOfuser(client, userId) {

    let result = await client.query(queries.getRegionOfuser, [userId]);
    if (result.rowCount > 0) {

    }
}

module.exports = {
    getFamilyTreeByFHeadID,
    generateRandomString
}