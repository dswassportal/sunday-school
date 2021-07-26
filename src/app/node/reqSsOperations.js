const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);
const queries = require('./static/reqSsOperations_queries');

async function getSSchoolData(loggedInUserId) {

    let client = await dbConnections.getConnection();

    try {
        let schoolData = [];
        let result = await client.query(queries.getParishesAndSchoolsByUserId, [loggedInUserId]);

        if (result.rowCount > 0) {
            for (let row of result.rows) {
                if (row.org_type === 'Sunday School') {
                    let index = result.rows.findIndex((item) => row.parent_org_id === item.org_id)
                    let temp = {
                        orgId: row.org_id,
                        name: row.name,
                        parishName: result.rows[index].name,
                        parishId: result.rows[index].org_id,
                        grades: []
                    }
                    schoolData.push(temp)
                }
            }
            
            for (let row of result.rows) {
                if (row.org_type === 'Grade') {
                    let sIndex = schoolData.findIndex((item) => row.parent_org_id === item.orgId);
                    if (sIndex !== -1) {
                        schoolData[sIndex].grades.push({
                            orgId: row.org_id,
                            name: row.name,
                        })
                    }
                }
            }
        }


        let currentTerm ={};
        let getTermRes = await client.query(queries.getCurrentTerm);
        if (getTermRes.rowCount > 0) {
            currentTerm = getTermRes.rows[0].current_term
        }

        // } else {
        //     query = `select org_id, org_type, "name", parent_org_id, address_line1, address_line2, city from t_organization to2 
        //      where org_id in (WITH recursive child_orgs 
        //                              AS (
        //                                  SELECT org_id
        //                                  FROM   t_organization parent_org 
        //                                  WHERE  org_id IN
        //                                          (
        //                                             SELECT b.org_id from
        //                                             t_user b
        //                                             WHERE  b.user_id = ${loggedInUserId}     
        //                                          )                                                    
        //                                  UNION
        //                                  SELECT     child_org.org_id child_id
        //                                  FROM       t_organization child_org
        //                                  INNER JOIN child_orgs c
        //                                  ON         c.org_id = child_org.parent_org_id ) SELECT *
        //                                      FROM   child_orgs)
        //          and to2.org_type in ('Sunday School', 'Grade') order by org_id;`
        // }

        //let result = await client.query(query);

        // AllstaffSchoolData = [];
        // for (let row of result.rows) {
        //     let temp = {};
        //     if (row.org_type === 'Sunday School') {
        //         temp.orgId = row.org_id;
        //         temp.name = row.name;
        //         temp.principalName = row.principal_name;
        //         temp.principalId = row.principal_id;
        //         schoolData.push(temp);
        //     } else if (row.org_type === 'Grade') {
        //         let index = schoolData.findIndex((item) => item.org == row.parentOrgId)
        //         let temp2 = {};
        //         if (index >= 0) {
        //             if (schoolData[index].grades === undefined) {
        //                 let grade = [];
        //                 temp2.orgId = row.org_id;
        //                 temp2.name = row.name;
        //                 grade.push(temp2)
        //                 schoolData[index].grades = grade;
        //             } else {
        //                 temp2.orgId = row.org_id;
        //                 temp2.name = row.name;
        //                 schoolData[index].grades.push(temp2);
        //             }
        //         }
        //     }

        // }



        // let queryGetSchoolStaffData = `select distinct org_staff_assignment_id, tssa.org_id, tssa.user_id, role_type, is_primary,
        //                             concat(tu.title,'. ',tu.first_name, ' ', tu.last_name) staff_name,turm.role_start_date,turm.role_end_date
        //                             from t_organization_staff_assignment tssa
        //                             left join t_user tu on tu.user_id=tssa.user_id
        //                             left join t_user_role_mapping turm on tu.user_id=turm.user_id
        //                             and tssa.is_deleted = false   ;`

        // if (role == 'Principal' || role == 'Vicar') {

        //     let staffData = await client.query(queryGetSchoolStaffData);
        //     let staffSchoolDataJson = {}
        //     for (let row of staffData.rows) {
        //         let staffSchoolData = {};
        //         staffSchoolData.staffSchoolAssignmentId = row.org_staff_assignment_id;
        //         staffSchoolData.schoolId = row.org_id;
        //         staffSchoolData.userId = row.user_id,
        //             staffSchoolData.roleType = row.role_type;
        //         staffSchoolData.isPrimary = row.is_primary;
        //         staffSchoolData.staffName = row.staff_name;
        //         staffSchoolData.roleStartDate = row.role_start_date;
        //         staffSchoolData.roleEndDate = row.role_end_date;
        //         AllstaffSchoolData.push(staffSchoolData);

        //     }
        //     metadata.AllstaffSchoolData = AllstaffSchoolData;

        // }

        // let termResult = await client.query(termData);
        return ({
            data: {
                status: 'success',
                schoolData: schoolData,
                currentTerm:currentTerm
            }
        })


    } catch (error) {
        console.error(`reqSsOperations.js::getSSchoolData() --> error as : ${error}`);
        reject(errorHandling.handleDBError('queryExecutionError'));

    } finally {
        client.release(false);
    }

}

async function getStaffAssmtBySchool(schoolId, term, loggedInUser) {


    let client = await dbConnections.getConnection();
    try {

        let response = {
            data: {
                status: 'success'
            }
        }

        // To get grade wise teacher and sub-teachers list for given schoolId
        let gradeArr = [];
        let principal = []
        let vicePrincipal = [];
        if (schoolId) {

            //if term not provided then retrun default current term's data.
            let result;
            if (term)
                result = await client.query(queries.getGradeStaffAssBySchoolIdReqTerm, [schoolId, term]);
            else
                result = await client.query(queries.getGradeStaffAssBySchoolIdDefTerm, [schoolId]);

            if (result.rowCount > 0) {
                for (let row of result.rows) {
                    if (row.org_type === 'Grade') {
                        let grdIndex = gradeArr.findIndex((item) => item.grade === row.org_name)
                        if (grdIndex < 0) {
                            let temp1 = { grade: row.org_name, gradeId: row.org_id }
                            if (row.is_primary === true) {
                                temp1.primary = [{
                                    staffName: row.staff_name,
                                    staffId: row.user_id,
                                    orgStaffAssId: row.org_staff_assignment_id
                                }]
                            } else if (row.is_primary === false) {
                                temp1.secondary = [{
                                    staffName: row.staff_name,
                                    staffId: row.user_id,
                                    orgStaffAssId: row.org_staff_assignment_id
                                }]
                            }
                            gradeArr.push(temp1);
                        } else {
                            if (row.is_primary === true) {
                                gradeArr[grdIndex].primary = [{
                                    staffName: row.staff_name,
                                    staffId: row.user_id,
                                    orgStaffAssId: row.org_staff_assignment_id
                                }]
                            } else if (row.is_primary === false) {
                                gradeArr[grdIndex].secondary = [{
                                    staffName: row.staff_name,
                                    staffId: row.user_id,
                                    orgStaffAssId: row.org_staff_assignment_id
                                }]
                            }
                        }

                    } else if (row.org_type === 'Sunday School' && row.role_type === 'Sunday School Principal') {
                        if (row.org_type !== null || row.org_type !== undefined)
                            principal.push({
                                staffName: row.staff_name,
                                staffId: row.user_id,
                                orgStaffAssId: row.org_staff_assignment_id
                            });
                    } else if (row.org_type === 'Sunday School' && row.role_type === 'Sunday School Vice Principal') {
                        if (row.org_type !== null || row.org_type !== undefined)
                            vicePrincipal.push({
                                staffName: row.staff_name,
                                staffId: row.user_id,
                                orgStaffAssId: row.org_staff_assignment_id
                            })
                    }
                }
            }
        }

        response.data.staffAssignment = gradeArr;
        response.data.principal = principal;
        response.data.vicePrincipal = vicePrincipal;

        if (term == undefined || term == null) {
            let termRes = await client.query(queries.getCurretTerm);
            if (termRes.rowCount > 0) {
                response.data.selectedTerm = termRes.rows[0].term_data;
            }

            //To get All terms 
            let termRes2 = await client.query(queries.getAllTerms);
            if (termRes2.rowCount > 0) {
                response.data.allTerms = termRes2.rows[0].term_data;
            }
        }

        return response;


    } catch (error) {
        console.error(`reqSsOperations.js::getStaffAssigBySchool() --> error as : ${error}`);
        return errorHandling.handleDBError('queryExecutionError');
    } finally {
        client.release(false);
    }
}

async function getAssignedGrades(loggedInUser) {

    let client = await dbConnections.getConnection();
    try {

        let response = {
            schools: [],
            status: 'success'
        }

        let result = await client.query(queries.getAllSchoolsOfTeacher, [loggedInUser]);
        if (result.rowCount > 0) {
            for (let i = 0; i < result.rows.length; i++) {
                response.schools[i] = {
                    schoolId: result.rows[i].org_id,
                    schoolName: result.rows[i].name,
                    grades: []
                };

                let gradesRes = await client.query(queries.getUserGrades, [result.rows[i].org_id, loggedInUser]);
                if (gradesRes.rowCount > 0) {

                    for (let row of gradesRes.rows) {
                        response.schools[i].grades.push({
                            'gradeId': row.org_id,
                            'gradeName': row.name
                        })
                    }
                }
            }
        }

        let getTermRes = await client.query(queries.getCurrentTerm);
        if (getTermRes.rowCount > 0) {
            response.currentTerm = getTermRes.rows[0].current_term
        }



        return {
            data: response
        }

    } catch (error) {
        console.error(`reqSsOperations.js::getAttendance() --> error as : ${error}`);
        return errorHandling.handleDBError('queryExecutionError');
    } finally {
        client.release(false);
    }

}


async function getGradeAttendance(loggedInUser, schoolId, grade, date) {

    let client = await dbConnections.getConnection();
    try {

        let attendance = [];
        let response = {};
        let term = {};
        console.debug(date);
        let result = await client.query(queries.getGradeWiseAttendance, [loggedInUser, schoolId, grade, date]);

        console.debug(`No of student found for grade ${grade}  are ${result.rowCount} `)

        if (result.rowCount > 0) {
            for (let row of result.rows) {

                if (term.school_term_detail_id === undefined) {
                    term.termDtlId = row.school_term_detail_id;
                    term.termYear = row.term_year;
                    term.termStartDate = row.term_start_date;
                    term.termEndDate = row.term_end_date;
                }

                attendance.push({
                    student_id: row.student_id,
                    student_name: row.student_name,
                    has_attended: row.has_attended,
                    sunday_school_attendace_id: row.sunday_school_attendace_id
                })

            }
            response.attendanceData = attendance;
            response.term = term;
        }
        return {
            data: response
        }

    } catch (error) {
        console.error(`reqSsOperations.js::getGradeAttendance() --> error as : ${error}`);
        return errorHandling.handleDBError('queryExecutionError');
    } finally {
        client.release(false);
    }
}


async function postSSAttendance(attData, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        await client.query('begin;');

        //Create temp table
        await client.query(queries.create_t_temp_attendance);

        let tempInsRes = await client.query(queries.insertIntoAttendanceTempTbl, [JSON.stringify(attData.attendance)]);
        console.debug(`${tempInsRes.rowCount} rows inserted in to t_temp_attendance.`);
        if (tempInsRes.rowCount > 0) {

            // Delete existing attendance record
            let attDelRes = await client.query(queries.deleteExistingAttendance,
                [attData.termRefId, attData.schoolId, attData.gradeId, attData.attendanceDate, attData.teacherId]);

            console.debug(`${attDelRes.rowCount} rows were deleted for attendance from t_sunday_school_attendace!`);

            //Insert new attendance data into the table
            let attInsRes = await client.query(queries.bulkInstetAttendance,
                [attData.schoolId, attData.gradeId, attData.teacherId, attData.termRefId,
                attData.attendanceDate, loggedInUser, new Date().toUTCString()]);

            console.debug(`${attInsRes.rowCount} rows were inserted for attendance in t_sunday_school_attendace!`);
        }

        await client.query('commit;');

        return ({
            data: {
                status: 'success'
            }
        })
    } catch (error) {
        await client.query('rollback;');
        console.error(`reqSsOperations.js::postSSAttendance() Rolled Back since error : ${error}`);
        return errorHandling.handleDBError('queryExecutionError');
    } finally {
        client.release(false);
    }


}




module.exports = {
    getSSchoolData,
    getStaffAssmtBySchool,
    getGradeAttendance,
    getAssignedGrades,
    postSSAttendance
}