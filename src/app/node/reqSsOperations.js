const { Client, Pool } = require('pg');
const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const { result, constant } = require('underscore');
const { temporaryAllocator } = require('@angular/compiler/src/render3/view/util');
const dbConnections = require(`${__dirname}/dbConnection`);


async function getSSchoolData(loggedInUserId, role) {

    let condition = '';
    if (role.toLowerCase() === 'vicar' || role.toLowerCase() === 'principal')
        condition = ` SELECT a.org_id
                            FROM   t_user_role_context a, t_user b
                            WHERE  b.user_id = ${loggedInUserId}
                            AND    a.user_id = b.user_id  `;

    else
     condition =  ` SELECT b.org_id from
                    t_user b
                    WHERE  b.user_id = ${loggedInUserId} `                            

        let client = await dbConnections.getConnection();

    try {

        let query = `select org_id, org_type, "name", parent_org_id, address_line1, address_line2, city from t_organization to2 
             where org_id in (WITH recursive child_orgs 
                                     AS (
                                         SELECT org_id
                                         FROM   t_organization parent_org 
                                         WHERE  org_id IN
                                                 (
                                                        ${condition}    
                                                 )                                                    
                                         UNION
                                         SELECT     child_org.org_id child_id
                                         FROM       t_organization child_org
                                         INNER JOIN child_orgs c
                                         ON         c.org_id = child_org.parent_org_id ) SELECT *
                                             FROM   child_orgs)
                 and to2.org_type in ('Sunday School', 'Grade') order by org_id;`

        let result = await client.query(query);

        schoolData = [];

        for (let row of result.rows) {
            let temp = {};
            if (row.org_type === 'Sunday School') {
                temp.orgId = row.org_id;
                temp.name = row.name;
                schoolData.push(temp);
            } else if (row.org_type === 'Grade') {
                let index = schoolData.findIndex((item) => item.org == row.parentOrgId)
                let temp2 = {};
                if (schoolData[index].grades === undefined) {
                    let grade = [];
                    temp2.orgId = row.org_id;
                    temp2.name = row.name;
                    grade.push(temp2)
                    schoolData[index].grades = grade;
                } else {
                    temp2.orgId = row.org_id;
                    temp2.name = row.name;
                    schoolData[index].grades.push(temp2);
                }
            }

        }

        return ({
            data: {
                status: 'success',
                schoolData: schoolData
            }
        })


    } catch (error) {
        console.error(`reqSsOperations.js::getSSchoolData() --> error as : ${error}`);
        reject(errorHandling.handleDBError('queryExecutionError'));

    } finally {
        client.release(false);
    }

}

module.exports = {
    getSSchoolData
}