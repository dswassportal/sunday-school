const { Client, Pool } = require('pg');
const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);



async function getCountryStates() {

    let client = await dbConnections.getConnection();
    return new Promise((resolve, reject) => {
        try {
            let getContriesStates = `SELECT Json_agg(a.con_state) as op_json 
             FROM   (SELECT Json_build_object('countryName', country_name, 'states', Json_agg
                       (
                              state_name))
                       AS con_state
                FROM   t_state_country_codes tscc
                GROUP  BY tscc.country_name) a; `;

            client.query(getContriesStates, (err, res) => {
                if (err) {
                    console.error(`miscReqOperations.js::getCountryStates() --> error while fetching results : ${err}`)
                    reject(errorHandling.handleDBError('queryExecutionError'));
                }

                if (res) {
                    let conStatejson = res.rows[0].op_json

                    resolve({
                        data: {
                            status: 'success',
                            countryState: conStatejson
                        }
                    })

                }
            });

        } catch (error) {
            console.error(`miscReqOperations.js::getCountryStates() --> error executing query as : ${error}`);
            reject(errorHandling.handleDBError('connectionError'));
        } finally {
            client.release(false);
        }
    });
}

async function getMembers(fireBaseId) {

    //  return new Promise((resolve, reject) => {
    let client = await dbConnections.getConnection();

    try {
        let noOfFamilyMembers = `select count(family_member_id) member_count from t_person_relationship tpr
            where family_head_id = 
                (select user_id from t_user tu 
                        where firebase_id = '${fireBaseId}') and is_deleted !=true;`;

        let result1 = await client.query(noOfFamilyMembers) /*, (err, res) => {
                if (err) {
                    console.error(`miscReqOperations.js::getMembers() --> error while fetching results : ${err}`)
                    return(errorHandling.handleDBError('queryExecutionError'));
                }

                if (res) {*/
        console.log(`firebase user UID : ${fireBaseId}  has ${result1.rows[0].member_count} family members.`)
        if (result1.rows[0].member_count > 0) {

            let fetchAllMembersData = `select jsonb_agg(
                            jsonb_build_object(
                            'userId', res.user_id, 
                            'name', concat(res.title, '. ',res.first_name, ' ',res.middle_name, ' ', res.last_name)
                            ) 
                        ) member_list from (
                    select distinct user_id, title, middle_name, first_name, last_name
                        from v_user tu2 where user_id in(
                    select distinct family_member_id from t_person_relationship tpr where family_member_id in 
                    (select user_id from t_user tu where email_id =
                        (select distinct email_id from t_user where firebase_id = '${fireBaseId}'))
                        and is_deleted != true
                        union 
                select distinct user_id  from v_user tu3 where firebase_id = '${fireBaseId}' and role_name = 'Family Head'
                        ) order by user_id 
                        ) res`;

                        //, res.last_name,  'role', res.role_name 
            let result2 = await client.query(fetchAllMembersData)/* (err, result) => {

                            if (err) {
                                console.error(`miscReqOperations.js::getMembers() --> error while fetching fetchAllMembersData results : ${err}`)
                                return(errorHandling.handleDBError('queryExecutionError'));
                            }
*/
            if (result2.rows[0].member_list != null) {

                console.log(`and the member list as follows : ${JSON.stringify({
                    data: {
                        status: 'success',
                        memberCount: result1.rows[0].member_count,
                        members: result2.rows[0].member_list
                    }
                })} `)

                return ({
                    data: {
                        status: 'success',
                        memberCount: result1.rows[0].member_count,
                        members: result2.rows[0].member_list
                    }
                })
            }
            // });
        } else {

            let getUserIdByFirebase = `select user_id from t_user tu where firebase_id = '${fireBaseId}';`
            let result2 = await client.query(getUserIdByFirebase)/*, (err, result) => {

                            if (err) {
                                console.error(`miscReqOperations.js::getMembers() --> error while fetching fetchAllMembersData results : ${err}`)
                                return(errorHandling.handleDBError('queryExecutionError'));
                            }*/
            return ({
                data: {
                    status: 'success',
                    userId: result2.rows[0].user_id,
                    memberCount: result1.rows[0].member_count,
                }
            })

            // });

        }
        //     }
        // });

    } catch (error) {
        console.error(`miscReqOperations.js::getMembers() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }
    //  });

}

async function getUserApprovalStatus(fbuid) {

    let client = await dbConnections.getConnection();
    try {
        let userApprovedStatus = `select 
                                case when is_approved = true then true else false end as approved,
                                user_id as userid
                                from 
                                    t_user tu 
                                where 
                                    firebase_id = '${fbuid}';`;

        let result = await client.query(userApprovedStatus)

        return {
            data: {
                status: 'success',
                isapproved: result.rows[0].approved,
                user: result.rows[0].userid
            }
        }


    } catch (error) {
        console.error(`miscReqOperations.js::getUserApprovalStatus() --> error while fetching results : ${error}`)
        return(errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }


}

async function handleLogIn_LogOut(reqContextData) {

    let client = await dbConnections.getConnection();
    try {
        let audLogEntry = `INSERT INTO t_audit_log
                            (user_id, session_id, "action", action_timestamp, ip_address, additional_details)
                           VALUES($1, $2, $3, $4 , $5, $6) returning audit_log_id;`;

        let audLogEntryValues = [
            reqContextData.userId,
            reqContextData.sessionId,
            reqContextData.actType,
            new Date().toUTCString(),
            reqContextData.ipAddr,
            reqContextData.userAgent
        ];

        let result = await client.query(audLogEntry, audLogEntryValues);
        console.log(`User ${reqContextData.userId}  ${(reqContextData.actType == 'LOG_IN') ? ' logged in ' : ' logged out '}, audit log entry id : ${result.rows[0].audit_log_id}`)

        return {
            data: {
                status: 'success'
            }
        }


    } catch (error) {
        console.error(`miscReqOperations.js::handleLogIn_LogOut() --> Error : ${error}`)
        return(errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }

}


async function getLookupMasterData(reqParams) {

    let client = await dbConnections.getConnection();
    try {

        let qArry = reqParams.split(',');
        let query = 'select type, code from t_lookup where '
        for (let i = 0; i < qArry.length; i++) {

            if (i === 0)
                query += ` lower(type) = lower('${qArry[i]}') `
            else
                query += ` or lower(type) = lower('${qArry[i]}') `
        }
        query += ' and is_deleted != true; ';

        let result = await client.query(query);
        let response = {};

        for (let type of qArry) {
            let key = type.toLowerCase() + 's'
            for (let row of result.rows) {
                if (type.toLowerCase() === row.type.toLowerCase()) {
                    if (response[key] == undefined){
                        response[key] = [];
                        response[key].push(row.code)
                    }else
                        response[key].push(row.code)
                }
            }
        }

        response.status = "success";
        return {
            data:response 
        };


    } catch (error) {
        console.error(`miscReqOperations.js::getLookupMasterData() --> Error : ${error}`)
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }

}


async function getRolesByUserId(userId) {

    let client = await dbConnections.getConnection();
    try {
        
        //let query = `select distinct role_id, org_id, role_start_date, role_end_date, org_type from v_user vu where user_id = ${userId} order by role_id;`
        let query =`select distinct role_id, role_start_date, role_end_date, org_id, org_type from v_user vu where user_id = ${userId} order by role_id;`;

        let roleResult = await client.query(query);
        let roles = [];
        if (roleResult.rowCount > 0) {
            for (let roleRow of roleResult.rows) {
                let role = {}
                role.roleId = roleRow.role_id;
                role.orgType = roleRow.org_type;
                role.orgId = roleRow.org_id;
                role.roleStartDate = roleRow.role_start_date;
                role.roleEndDate = roleRow.role_end_date;

                if (_.findWhere(roles, role) == null) {
                    roles.push(role);
                }
            } // for loop of roles
        } // edd of if roles.rowCount > 0


        return {
            data: {
                status: 'success',
                roles: roles
            }
        }


    } catch (error) {
        console.error(`miscReqOperations.js::getRolesByUserId() --> Error : ${error}`)
        return(errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }

}

module.exports = {
    getCountryStates,
    getMembers,
    getUserApprovalStatus,
    handleLogIn_LogOut,
    getLookupMasterData,
    getRolesByUserId
}