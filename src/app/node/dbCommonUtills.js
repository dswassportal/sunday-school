const queries = require(`${__dirname}/static/dbCommonUtils_queries.js`);



async function getFamilyTreeByFHeadID(fhId, client) {
    if (fhId !== null || fhId !== undefined) {
        let result = await client.query(queries.getFamilyMembersFHid, [fhId])
        if (result.rowCount > 0)
            return result.rows
        else return [];
    }
}

module.exports = {
    getFamilyTreeByFHeadID
}