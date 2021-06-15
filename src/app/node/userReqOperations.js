const queries = require(`${__dirname}/static/userReqOperations_queries`);
const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);

async function setUserApprovalState(userData, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        console.log(`User ${userData.userId}, setUserApprovalState user status is  ${userData.isApproved} `)
        if (userData.isApproved === true) {
            //  try {
            await client.query('begin;');
            let chkMemberExistsRes = await client.query(queries.isUserAlreadyMember, [userData.userId]);
            console.debug(`Is ${userData.userId} user  already a member? ->  ${chkMemberExistsRes.rows[0].is_membera}`);
            if (chkMemberExistsRes.rows[0].is_member === true) {
                //if user getting reapproved. end previous membership.
                console.log(`User  ${userData.userId}, Membership is being updated `);
                //  let currDate = new Date().toUTCString();
                let queToMarkDelete = await client.query(queries.toMarkMembershipDelted,
                    [new Date(), loggedInUser, new Date().toUTCString(), userData.userId]);
                if (queToMarkDelete.rowCount > 0) {
                    console.debug(`User ${userData.userId}, In t_user_parish  ${queToMarkDelete.rowCount} rows marked as deleted!`);

                    let newMembershipRes = await client.query(queries.reInsertMembership,
                        [userData.orgId, new Date(), loggedInUser, new Date().toUTCString(), queToMarkDelete.rows[0].user_parish_id])

                    console.debug(`User  ${userData.userId}, Rows inserted in to t_user_parish: `, newMembershipRes.rowCount);

                    //Marking user is approved in t_user table
                    let isApproveStatus = await client.query(queries.markUserApproved, [userData.userId]);
                    if (isApproveStatus.rowCount > 0)
                        console.debug(`User ${userData.userId}, marked as approved in t_user.`)
                    await client.query('commit;');

                    return {
                        data: {
                            status: 'success'
                        }
                    }
                }
            } else {

                console.debug(`User ${userData.userId}, is not member yet.`)
                let randomMemId = (Math.random() * (9999999 - 1000000) + 1000000).toFixed(0);
                for (; ;) {
                    let isMemIdExists = await client.query(queries.isMemberIdExists, [randomMemId]);
                    console.debug(`is ${randomMemId} member id exists? - > ${isMemIdExists.rows[0].is_mem_id_exists}`);
                    if (isMemIdExists.rows[0].is_mem_id_exists === false) {
                        let putRowInParisgTblValues = await client.query(queries.putRowInParisgTbl,
                            [userData.userId, userData.orgId, randomMemId, userData.memberType,
                            new Date().toISOString(), loggedInUser,
                            new Date().toISOString()]);
                        if (putRowInParisgTblValues.rowCount > 0) {
                            console.log(`User ${userData.userId}, newly created member id is : ${randomMemId}`);

                            await client.query(queries.insertOpLogTable,
                                [userData.userId, 'Request Approved', loggedInUser, new Date().toUTCString()]);

                            //Marking user is approved in t_user table
                            let isApproveStatus = await client.query(queries.markUserApproved, [userData.userId]);
                            if (isApproveStatus.rowCount > 0)
                                console.debug(`User ${userData.userId}, marked as approved in t_user.`)

                            await client.query('commit;');
                            return {
                                data: {
                                    status: 'success'
                                }
                            }

                        }
                        break;
                    }else  randomMemId = (Math.random() * (9999999 - 1000000) + 1000000).toFixed(0);
                }
            }

            // } catch (error) {
            //     console.error(`userReqOperations.js::setUserApprovalState() --> error executing query as : ${error}`);
            //     return (errorHandling.handleDBError('connectionError'));
            // }

        } else if (userData.isApproved == false) {

            let moveUsrTblRowtoUsrHistyTbl = `insert into t_user_history(
                                            user_id , email_id, org_id, firebase_id, 
                                            title, first_name, middle_name, last_name, 
                                            about_yourself, is_locked, is_deleted, 
                                            is_family_head, created_by, created_date, 
                                            updated_by, updated_date, is_approved, member_type)
                                            select 
                                            user_id , email_id, org_id, firebase_id, 
                                            title, first_name, middle_name, last_name, 
                                            about_yourself, is_locked, is_deleted, 
                                            is_family_head, created_by, created_date, 
                                            updated_by, updated_date, is_approved, member_type
                                            from t_user tu where user_id = ${userData.userId};`

            let deleteFromUsrTbl = `delete from t_user where user_id = ${userData.userId};`;

            let deleteFromPrsonTbl = `delete from t_person where user_id = ${userData.userId};`;

            await client.query(moveUsrTblRowtoUsrHistyTbl);
            console.log('Copied row form t_user to t_user_history table for user id : ' + userData.userId);
            await client.query(deleteFromUsrTbl);
            console.log('Deleted row from t_user table! for user id : ' + userData.userId);
            await client.query(deleteFromPrsonTbl);
            console.log('deleted row from t_person table for user id : ' + userData.userId);

            let operationTblQuery = `INSERT INTO public.t_user_operation_log
    (user_id, operation_type, reason, performed_by, performed_date) VALUES($1, $2, $3 ,$4, $5);`;

            let operationTblQueryValues = [userData.userId, 'Request Rejected', userData.comment, userData.loggedInuserId, new Date().toISOString()]

            await client.query(operationTblQuery, operationTblQueryValues);
            console.log('Inserted row into t_user_operation_log table for user id: ' + userData.userId);
            await client.query('commit;');
            return {
                data: {
                    status: 'success'
                }
            }

        }

    } catch (error) {
        await client.query('rollback;');
        console.error(`userReqOperations.js::setUserApprovalState() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release()
    }
}

async function updateUnApprovedUser(userData) {
    console.log("userReqOperations.js::updateUnApprovedUser called. Updating unapproved user's data...");

    let client = await dbConnections.getConnection();
    try {

        let updateUserTableStmt = `UPDATE t_user
                                SET org_id=$1, title=$2, first_name=$3, last_name=$4, about_yourself=$5, 
                                updated_by=$6, updated_date=$7, member_type=$8
                                WHERE user_id=$9;`;

        let updateUserTableValues = [
            userData.orgId,
            userData.title,
            userData.firstName,
            userData.lastName,
            userData.abtyrslf,
            userData.userId,
            new Date().toISOString(),
            userData.memberType,
            userData.userId
        ];
        console.log('t_user updated!');

        await client.query(updateUserTableStmt, updateUserTableValues);


        let updatePersonTableStmt = `UPDATE t_person
                              SET dob=$1, updated_by=$2, updated_date=$3, mobile_no=$4
                              WHERE user_id=$5;`;

        let updatePersonTableValues = [
            userData.dob,
            userData.userId,
            new Date().toUTCString(),
            userData.mobileNo,
            userData.userId
        ]

        await client.query(updatePersonTableStmt, updatePersonTableValues);
        console.log('t_person updated!');

        return {
            data: {
                status: "success"
            }
        }

    } catch (error) {
        console.error(`userReqOperations.js::updateUnApprovedUser() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }
}

async function setStaffAssignment(staffData, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        await client.query("BEGIN");
        // Preparing roles json so we dont need to query it again and again
        let roles = {};
        let getRoleIds = `select tr."name" role_name , tr.role_id from t_role tr where name = 'Teacher' or name = 'Sunday School Principal' or name = 'Sunday School Vice Principal';`
        let result = await client.query(getRoleIds);
        for (let row of result.rows) {
            roles[row.role_name] = row.role_id;
            console.log("role name and id is : " + row.role_name + " " + row.role_id)
        }

        let ssStartDate = staffData.ssStartDate;
        let ssEndDate = staffData.ssEndDate;

        for (let staffMember of staffData.staffAssignment) {

            /****************************** Upsert t_user_role_mapping ************************************/
            let updateRoleMappingQuery = `UPDATE t_user_role_mapping
                                            SET role_id=$1, user_id=$2, role_start_date=$3, role_end_date=$4 
                                            WHERE role_id=$1 and user_id=$2 and is_deleted = false`;

            let updateRoleMappingValues = [roles[staffMember.roleType], staffMember.staffId, ssStartDate, ssEndDate]
            let result = await client.query(updateRoleMappingQuery, updateRoleMappingValues);
            let insertRoleMappingQuery = ` INSERT INTO t_user_role_mapping (user_id, role_id, role_start_date, role_end_date)
                                            select $1, $2, $3, $4  
                                            WHERE NOT EXISTS (
                                            SELECT 1 FROM t_user_role_mapping turm 
                                                                WHERE user_id = $1 
                                                                and role_id = $2
                                                                and is_deleted = false
                                                        ) returning user_role_map_id;`

            let insertRoleMappingValues = [staffMember.staffId, roles[staffMember.roleType], ssStartDate, ssEndDate]

            // and role_start_date = ${ssStartDate}
            // and role_end_data = ${ssEndDate}
            result = await client.query(insertRoleMappingQuery, insertRoleMappingValues);
            if (result.rowCount > 0) {
                let userRoleMapId = result.rows[0].user_role_map_id;
                console.log(' Rows inserted into t_user_role_mapping  : ' + result.rowCount + ' and newly generated user_role_map_id is : ' + userRoleMapId);

                /******************************  Upsert t_user_role_context ****************************************/
                // let updateRoleContext = `UPDATE t_user_role_context
                //                                 SET org_id = $1 
                //                                     updated_by = $2, 
                //                                     updated_date = $3
                //                                 where  role_id = $4, user_id = $5, is_deleted = false;`;                                              
                if (staffMember.gradeId > 0 && staffMember.staffId > 0) {
                    let insertRoleContext = ` INSERT INTO t_user_role_context (user_id, role_id, org_id, created_by, created_date, user_role_map_id)
                                            select $1, $2, $3, $4, $5, $6  
                                            WHERE NOT EXISTS (
                                            SELECT 1 FROM t_user_role_context turm 
                                                                WHERE user_id = $1 
                                                                and role_id = $2
                                                                and org_id = $3
                                                                and is_deleted = false
                                                        );`


                    let insertRoleContextvValues = [staffMember.staffId, roles[staffMember.roleType], staffMember.gradeId, loggedInUser, new Date().toUTCString(), userRoleMapId]

                    result = await client.query(insertRoleContext, insertRoleContextvValues);

                }
            }
            /******************************  Upsert t_staff_school_assignment ****************************************/
  /******************************  Upsert t_staff_school_assignment ****************************************/

            let insertStaffSchool = ` INSERT INTO t_organization_staff_assignment (org_id, user_id, role_id, role_type, is_primary, created_by, created_date
			)
                                            select $1, $2, $3, $4, $5, $6, $7
                                            WHERE NOT EXISTS (
                                            SELECT 1 FROM t_organization_staff_assignment tssa 
                                                                WHERE org_id = $1
                                                                and user_id = $2
                                                                and role_id = $3
                                                        ) returning org_staff_assignment_id;`
         
            //let insertStaffSchoolValues = [staffData.schoolId, staffMember.staffId, roles[staffMember.roleType], staffMember.roleType, staffMember.isPrimary, loggedInUser, new Date().toUTCString()]
            let insertStaffSchoolValues = [staffMember.gradeId, staffMember.staffId, roles[staffMember.roleType],
											staffMember.roleType, staffMember.isPrimary, loggedInUser, new Date().toUTCString()
											]
            //let insertStaffSchoolValues = [staffMember.gradeId, staffMember.staffId, roles[staffMember.roleType], staffMember.roleType, staffMember.isPrimary, loggedInUser, new Date().toUTCString()]
          
            result = await client.query(insertStaffSchool, insertStaffSchoolValues);
           

        }

        await client.query("COMMIT;");

        return {
            data: {
                status: "success",
            }
        }



    } catch (error) {
        client.query("ROLLBACK");
        console.error(`userReqOperations.js::setStaffAssignment() --> error as : ${error}`);
        console.log("Transaction ROLLBACK called");
        return (errorHandling.handleDBError('connectionError'));

    } finally {
        client.release();
    }

}

module.exports = {
    setUserApprovalState,
    updateUnApprovedUser,
    setStaffAssignment
}
