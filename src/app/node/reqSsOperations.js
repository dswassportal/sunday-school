const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);


async function getSSchoolData(loggedInUserId, role) {

    let client = await dbConnections.getConnection();

    try {

        let query = '';
        if (role) {

            query = `select distinct to2.org_id, org_type, "name", parent_org_id, address_line1, address_line2, city, turc.user_id principal_id,
                            (case when tu.title is null then null 
                                else concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ', tu.last_name) 
                                end) principal_name
                        from t_organization to2 join  
                                (WITH recursive child_orgs 
                                                        AS (
                                                            SELECT org_id
                                                            FROM   t_organization parent_org 
                                                            WHERE  org_id IN
                                                                    (
                                                                        SELECT a.org_id
                                                                    FROM   t_user_role_context a, t_user b
                                                                    WHERE  b.user_id = ${loggedInUserId}
                                                                    AND    a.user_id = b.user_id  )                                                    
                                                            UNION
                                                            SELECT     child_org.org_id child_id
                                                            FROM       t_organization child_org
                                                            INNER JOIN child_orgs c
                                                            ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                                FROM   child_orgs) hyrq on to2.org_id  = hyrq.org_id
                          left join t_user_role_context turc on  hyrq.org_id = turc.org_id and turc.role_id = (select role_id from t_role where "name" = 'Sunday School Principal')  
                          left join t_user tu on turc.user_id = tu.user_id; `



        } else {
            query = `select org_id, org_type, "name", parent_org_id, address_line1, address_line2, city from t_organization to2 
             where org_id in (WITH recursive child_orgs 
                                     AS (
                                         SELECT org_id
                                         FROM   t_organization parent_org 
                                         WHERE  org_id IN
                                                 (
                                                    SELECT b.org_id from
                                                    t_user b
                                                    WHERE  b.user_id = ${loggedInUserId}     
                                                 )                                                    
                                         UNION
                                         SELECT     child_org.org_id child_id
                                         FROM       t_organization child_org
                                         INNER JOIN child_orgs c
                                         ON         c.org_id = child_org.parent_org_id ) SELECT *
                                             FROM   child_orgs)
                 and to2.org_type in ('Sunday School', 'Grade') order by org_id;`
        }
        let result = await client.query(query);
        schoolData = [];

        for (let row of result.rows) {
            let temp = {};
            if (row.org_type === 'Sunday School') {
                temp.orgId = row.org_id;
                temp.name = row.name;
                temp.principalName = row.principal_name;
                temp.principalId = row.principal_id;
                schoolData.push(temp);
            } else if (row.org_type === 'Grade') {
                let index = schoolData.findIndex((item) => item.org == row.parentOrgId)
                let temp2 = {};
                if (index >= 0) {
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