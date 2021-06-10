const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);


async function getSSchoolData(loggedInUserId, role) {

    let client = await dbConnections.getConnection();

    try {
        let metadata = {};
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
        AllstaffSchoolData = [];
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
                    metadata.schoolData = schoolData;
                }
            }

        }



        let queryGetSchoolStaffData = `select distinct org_staff_assignment_id, tssa.org_id, tssa.user_id, role_type, is_primary,
                                    concat(tu.title,'. ',tu.first_name, ' ', tu.last_name) staff_name,turm.role_start_date,turm.role_end_date
                                    from t_organization_staff_assignment tssa
                                    left join t_user tu on tu.user_id=tssa.user_id
                                    left join t_user_role_mapping turm on tu.user_id=turm.user_id
                                    and tssa.is_deleted = false   ;`

        if (role == 'Principal' || role == 'Vicar') {

            let staffData = await client.query(queryGetSchoolStaffData);
            let staffSchoolDataJson = {}
            for (let row of staffData.rows) {
                let staffSchoolData = {};
                staffSchoolData.staffSchoolAssignmentId = row.org_staff_assignment_id;
                staffSchoolData.schoolId = row.org_id;
                staffSchoolData.userId = row.user_id,
                    staffSchoolData.roleType = row.role_type;
                staffSchoolData.isPrimary = row.is_primary;
                staffSchoolData.staffName = row.staff_name;
                staffSchoolData.roleStartDate = row.role_start_date;
                staffSchoolData.roleEndDate = row.role_end_date;
                AllstaffSchoolData.push(staffSchoolData);

            }
            metadata.AllstaffSchoolData = AllstaffSchoolData;

        }

        let termData = `select jsonb_agg(
                                        jsonb_build_object(
                                            'term', tstd.term_year,
                                            'startDate', tstd.term_start_date,
                                            'endDate', tstd.term_end_date,
                                            'termDtlId', tstd.school_term_detail_id 
                                        ) order by term_start_date
                                    ) term_data from t_school_term_detail tstd
                                    where is_deleted = false ;`

        let termResult = await client.query(termData);
        return ({
            data: {
                status: 'success',
                schoolData: metadata,
                ssTerms: (termResult.rowCount > 0) ? termResult.rows[0].term_data : []
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