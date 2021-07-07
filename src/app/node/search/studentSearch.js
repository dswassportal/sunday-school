const _ = require('underscore');
const errorHandling = require('../ErrorHandling/commonDBError');
const dbConnections = require(`../dbConnection`)



function isValidString(str) {
    console.debug('str :: ', str);
    if (str === '' || str === undefined || str === null)
        return false;
    else return true;

}
async function searchStudents(filterParamJson, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {

        let andConditions = [];
        let orConditions = [];

        // console.debug('isValidString(filterParamJson.parentFirstName)', filterParamJson.parentFirstName);
        // console.debug('isValidString(filterParamJson.parentLastName)', filterParamJson.parentLastName);
        // console.debug('isValidString(filterParamJson.parentPhoneNo)', filterParamJson.parentPhoneNo);
        //   console.debug('isValidString(filterParamJson.parentPhoneNo)', isValidString(filterParamJson.parentPhoneNo));



        //And conditions
        if (isValidString(filterParamJson.parentFirstName))
            andConditions.push(`lower(vs.parent_first_name) like '%${filterParamJson.parentFirstName}%'`)
        if (isValidString(filterParamJson.parentLastName))
            andConditions.push(`lower(vs.parent_last_name) like '%${filterParamJson.parentLastName}%'`)

        //Or Conditions       
        if (isValidString(filterParamJson.parentPhoneNo)) {
            orConditions.push(`vs.parent_mobile_no like '%${filterParamJson.parentPhoneNo}%'`)
            orConditions.push(`vs.parent_home_ph_no like '%${filterParamJson.parentPhoneNo}%'`)
        }

        let query = `select * from v_student vs
        where  
            ${(andConditions.length > 0) ? andConditions.join(` AND `) : ''}
            ${(orConditions.length > 0 && andConditions.length > 0) ? ` AND ` : ''}
            ${(orConditions.length > 0) ? orConditions.join(` OR `) : ''}
            ${(orConditions.length === 0 && andConditions.length === 0) ? '' : ` AND `} 
        vs.student_org in (WITH recursive child_orgs 
                                        AS (
                                            SELECT org_id
                                            FROM   t_organization parent_org 
                                            WHERE  org_id IN
                                                    (
                                                        SELECT a.org_id
                                                    FROM   t_user_role_context a, t_user b
                                                    WHERE  b.user_id = ${loggedInUser}
                                                    AND    a.user_id = b.user_id
                                                    and    b.is_locked = false 
                                                    and    b.is_deleted = false
                                                    and    a.is_deleted = false)                                                    
                                            UNION
                                            SELECT     child_org.org_id child_id
                                            FROM       t_organization child_org
                                            INNER JOIN child_orgs c
                                            ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                FROM   child_orgs)`;

        let result = await client.query(query);
        console.debug('Search result rows found : ' + result.rowCount);
        // if (result.rowCount > 0) {
        //     for(let row of result.rows ){
        //         console.debug(row.student_first_name)
        //     }
        // }
        return ({
            data: {
                status: 'success',
                result: result.rowCount > 0 ? result.rows : []
            }
        })

    } catch (error) {
        console.error(`studentSearch.js::getStudents() : ${error}`);
        return (errorHandling.handleDBError('connectionError'));

    } finally {
        client.release(false);
    }
}

async function getSearchables(loggedInUser) {

    let client = await dbConnections.getConnection();
    try {

        let query = `with recursive child_orgs as (
                        select org_id org_id, org_type, name org_name, parent_org_id parent_id from t_organization parent_org
                        where org_id in (WITH recursive child_orgs 
                                                                            AS (
                                                                                SELECT org_id
                                                                                FROM   t_organization parent_org 
                                                                                WHERE  org_id IN
                                                                                        (
                                                                                            SELECT a.org_id
                                                                                        FROM   t_user_role_context a, t_user b
                                                                                        WHERE  b.user_id = $1
                                                                                        AND    a.user_id = b.user_id
                                                                                        and    b.is_locked = false 
                                                                                        and    b.is_deleted = false
                                                                                        and    a.is_deleted = false)                                                    
                                                                                UNION
                                                                                SELECT     child_org.org_id child_id
                                                                                FROM       t_organization child_org
                                                                                INNER JOIN child_orgs c
                                                                                ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                                                    FROM   child_orgs)
                        union
                        select child_org.org_id child_id, child_org.org_type, child_org.name child_name, child_org.parent_org_id pid
                        from t_organization child_org
                        inner join child_orgs c on c.parent_id = child_org.org_id
                    )select * from child_orgs;`;

        let response = {
            diocese: [],
            parishes: [],
            regions: []
        };

        let result = await client.query(query, [loggedInUser]);
        if (result.rowCount > 0) {
            for (let row of result.rows) {
                if (row.org_type === 'Diocese') {
                    let index = response.diocese.findIndex((item) => row.org_id === item.orgId);
                    if (index === -1)
                        response.diocese.push({
                            orgId: row.org_id,
                            name: row.org_name,
                        })
                }
                if (row.org_type === 'Region') {
                    let index = response.regions.findIndex((item) => row.org_id === item.orgId);
                    if (index === -1)
                        response.regions.push({
                            orgId: row.org_id,
                            name: row.org_name,
                        })
                }
                if (row.org_type === 'Parish') {
                    let index = response.parishes.findIndex((item) => row.org_id === item.orgId);
                    if (index === -1)
                        response.parishes.push({
                            orgId: row.org_id,
                            name: row.org_name,
                        })
                }
            }
        }
        response.status = 'success';
        return ({

            data: response
        });

    } catch (error) {
        console.error(`studentSearch.js::getStudents() : ${error}`);
        return (errorHandling.handleDBError('connectionError'));

    } finally {
        client.release(false);
    }
}

module.exports = {
    searchStudents,
    getSearchables
}