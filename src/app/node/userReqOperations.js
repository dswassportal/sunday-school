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
                    } else randomMemId = (Math.random() * (9999999 - 1000000) + 1000000).toFixed(0);
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
        let getSSRoles = await client.query(queries.getSchoolRoleIds);
        if (getSSRoles.rowCount > 0) {
            for (let row of getSSRoles.rows)
                roles[row.role_name] = row.role_id;
        } else throw "Roles not found in db associated to sunday school.";

        // Sunday School Vice Principal
        // Sunday School Principal
        // Sunday School Teacher

        let ssStartDate;
        let ssEndDate;
        let termDtlId;

        if (staffData.sundaySchoolTerm) {
            if (staffData.sundaySchoolTerm.length > 0) {
                ssStartDate = staffData.sundaySchoolTerm[0].startDate;
                ssEndDate = staffData.sundaySchoolTerm[0].endDate;
                termDtlId = staffData.sundaySchoolTerm[0].termDtlId;;
            } else throw "Term details not provided."
        } else throw "Term details not provided."



        // Operate on Teachers Data
        await assignRoleWiseGradeStaff({
            roleType: "teacher",
            parentObj: "teacherGrades",
            isPrimary: true
        },
            {
                ssStartDate: ssStartDate,
                ssEndDate: ssEndDate,
                termDtlId: termDtlId
            },
            roles, staffData, client, loggedInUser);

        // Operate on Sub-Teachers Data            
        await assignRoleWiseGradeStaff({
            roleType: "substituteTeacher",
            parentObj: "teacherGrades",
            isPrimary: false
        },
            {
                ssStartDate: ssStartDate,
                ssEndDate: ssEndDate,
                termDtlId: termDtlId
            },
            roles, staffData, client, loggedInUser);


        //to process principal and vice principal data

        await assignRoleWisePrincipalStaff({
            roleType: 'Sunday School Principal',
            parenObj: 'principal',
            isPrimary: true
        },
            {
                ssStartDate: ssStartDate,
                ssEndDate: ssEndDate,
                termDtlId: termDtlId
            }, roles, staffData, client, loggedInUser);

        await assignRoleWisePrincipalStaff({
            roleType: 'Sunday School Vice Principal',
            parenObj: 'vicePrincipal',
            isPrimary: true
        },
            {
                ssStartDate: ssStartDate,
                ssEndDate: ssEndDate,
                termDtlId: termDtlId
            }, roles, staffData, client, loggedInUser);


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


async function assignRoleWisePrincipalStaff(config, termData, roles, staffData, client, loggedInUser) {

    console.log(`Processing  \"${config.roleType}\" data from provided payload`);

    if (!staffData.schoolId) throw `School ID not found while inserting ${config.roleType}`;
    let schoolId = staffData.schoolId

    let crtedRoles = [];
    if (staffData[config['parenObj']]) {
        if (staffData[config['parenObj']].length > 0) {
            let staffObj = staffData[config['parenObj']][0];
            if (!staffObj.orgStaffAssId) {
                // To insert mapping into t_user_role_mapping
                let roleInsRes = await client.query(queries.insertStaffRole,
                    [staffObj.staffId, roles[config.roleType], termData.ssStartDate, termData.ssEndDate]);
                if (roleInsRes.rowCount > 0) {
                    // To insert role context into t_user_role_context
                    let contxInsRes = await client.query(queries.insertRoleContext,
                        [staffObj.staffId, roles[config.roleType], schoolId,
                            loggedInUser, new Date().toUTCString(), roleInsRes.rows[0].user_role_map_id]);
                    if (contxInsRes.rowCount > 0)
                        crtedRoles.push(roleInsRes.rows[0].user_role_map_id)
                }

                let existingOrgStaffIds = [];

                //To checek wether the staff assignment exists or not for given grade, user, teacher type and with the term
                let staffExistanceCheck = await client.query(queries.checkIsStaffAlreadyAssigned,
                    [schoolId, staffObj.staffId, roles[config.roleType], false, config.isPrimary, termData.termDtlId]);

                if (staffExistanceCheck.rowCount > 0) {
                    existingOrgStaffIds.push(staffExistanceCheck.rows[0].org_staff_assignment_id)
                } else {

                    //if assignment dosent exist then insert the staff member.
                    let staffAssRes = await client.query(queries.insertStaffAssignmt,
                        [schoolId, staffObj.staffId, roles[config.roleType], config.roleType, config.isPrimary,
                            loggedInUser, new Date().toUTCString(), termData.termDtlId]);

                    if (staffAssRes.rowCount > 0) {
                        existingOrgStaffIds.push(staffAssRes.rows[0].org_staff_assignment_id);
                    }

                    console.debug(' Staff mapping Ids are for school  ' + schoolId + " are " + JSON.stringify(existingOrgStaffIds));
                    if (existingOrgStaffIds.length > 0) {
                        // ro remove old staff assignment if there exists any for given grade, user, teacher type and with term
                        let tempQuery = queries.deleteStaffOrgMapping.replace('$5', existingOrgStaffIds.join(','));
                        let delResult = await client.query(tempQuery,
                            [schoolId, roles[config.roleType], config.isPrimary, termData.termDtlId])
                        if (delResult.rowCount > 0) {
                            console.debug("Deleted(soft) mapping: " + JSON.stringify(delResult.rows));
                        }
                    }
                }
            }

        }

    }

    console.debug(`Roles created t_user_role_mapping, t_user_role_context : ${JSON.stringify(crtedRoles)} `);

}

async function assignRoleWiseGradeStaff(config, termData, roles, staffData, client, loggedInUser) {

    let updtedRoles = [];
    let crtedRoles = [];
    let staffAssigned = [];
    let staffAssDeleted = [];

    console.log(`Processing  \"${config.roleType}\" data from provided payload`);

    //console.log()
    //if (staffData.teacherGrades){
    for (let assObj of staffData[config["parentObj"]]) {
        if (assObj[config["roleType"]]) {
            if (assObj[config["roleType"]].length > 0) {
                let staffObj = assObj[config["roleType"]][0];
                //  console.debug("Processing teacher : " + JSON.stringify(staffObj) + ' and school id is : ' + assObj.gradeId)
                if (!staffObj.orgStaffAssId) {
                    // To insert mapping into t_user_role_mapping
                    let roleInsRes = await client.query(queries.insertStaffRole,
                        [staffObj.staffId, roles['Sunday School Teacher'], termData.ssStartDate, termData.ssEndDate]);
                    if (roleInsRes.rowCount > 0) {
                        // To insert role context into t_user_role_context
                        let contxInsRes = await client.query(queries.insertRoleContext,
                            [staffObj.staffId, roles['Sunday School Teacher'], assObj.gradeId,
                                loggedInUser, new Date().toUTCString(), roleInsRes.rows[0].user_role_map_id]);
                        if (contxInsRes.rowCount > 0)
                            crtedRoles.push(roleInsRes.rows[0].user_role_map_id)
                    }

                    let existingOrgStaffIds = [];

                    //To checek wether the staff assignment exists or not for given grade, user, teacher type and with the term
                    let staffExistanceCheck = await client.query(queries.checkIsStaffAlreadyAssigned,
                        [assObj.gradeId, staffObj.staffId, roles['Sunday School Teacher'], false, config.isPrimary, termData.termDtlId]);

                    if (staffExistanceCheck.rowCount > 0) {
                        existingOrgStaffIds.push(staffExistanceCheck.rows[0].org_staff_assignment_id)
                    } else {

                        //if assignment dosent exist then insert the staff member.
                        let staffAssRes = await client.query(queries.insertStaffAssignmt,
                            [assObj.gradeId, staffObj.staffId, roles['Sunday School Teacher'], 'Sunday School Teacher', config.isPrimary,
                                loggedInUser, new Date().toUTCString(), termData.termDtlId]);

                        if (staffAssRes.rowCount > 0) {
                            existingOrgStaffIds.push(staffAssRes.rows[0].org_staff_assignment_id);
                        }

                        console.debug(' Staff mapping Ids are for grade  ' + assObj.gradeId + " are " + JSON.stringify(existingOrgStaffIds));
                        if (existingOrgStaffIds.length > 0) {
                            // ro remove old staff assignment if there exists any for given grade, user, teacher type and with term
                            let tempQuery = queries.deleteStaffOrgMapping.replace('$5', existingOrgStaffIds.join(','));
                            let delResult = await client.query(tempQuery,
                                [assObj.gradeId, roles['Sunday School Teacher'], config.isPrimary, termData.termDtlId])
                            if (delResult.rowCount > 0) {
                                console.debug("Deleted(soft) mapping: " + JSON.stringify(delResult.rows));
                            }
                        }
                    }
                }
            }
        }

    }




    // console.debug(`Roles updated in t_user_role_mapping are : ${JSON.stringify(updtedRoles)} `);
    console.debug(`Roles created t_user_role_mapping, t_user_role_context : ${JSON.stringify(crtedRoles)} `);
    // console.debug(`Staff assignment has been done for : ${JSON.stringify(staffAssigned)}`);
    // console.debug(`Staff assignment has been updated for : ${JSON.stringify(staffAssUpdated)}`);
    // }

}

module.exports = {
    setUserApprovalState,
    updateUnApprovedUser,
    setStaffAssignment
}
