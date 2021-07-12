
const getGradeStaffAssBySchoolIdDefTerm = `select to2.org_id,
                                            to2."name" org_name,
                                            org_type,
                                            tosa.user_id,
                                            tosa.is_primary,
                                            tosa.role_type,
                                            case when tu.first_name is null then null else
                                                    concat(tu.title,'. ', tu.first_name, ' ', tu.middle_name , ' ',tu.last_name) end staff_name ,
                                            tstd.school_term_detail_id,
                                            to2."sequence",
                                            tosa.org_staff_assignment_id 
                                            from t_organization to2
                                            left join t_organization_staff_assignment tosa on to2.org_id = tosa.org_id and tosa.is_deleted != true
                                            left join t_user tu on tosa.user_id = tu.user_id 
                                            left join t_school_term_detail tstd on tosa.school_term_detail_id = tstd.school_term_detail_id 
                                            and current_date > tstd.term_start_date 
                                            and current_date < tstd.term_end_date
                                            where to2.org_id in (
                                                                (WITH recursive child_orgs 
                                                            AS (
                                                                SELECT org_id
                                                                FROM   t_organization parent_org 
                                                                WHERE  org_id = $1
                                                                UNION
                                                                SELECT     child_org.org_id child_id
                                                                FROM       t_organization child_org
                                                                INNER JOIN child_orgs c
                                                                ON         c.org_id = child_org.parent_org_id )
                                                                SELECT * FROM   child_orgs))
                                            and to2.is_deleted != true  order by to2."sequence";`;


const getGradeStaffAssBySchoolIdReqTerm = `select to2.org_id,
                                            to2."name" org_name,
                                            org_type,
                                            tosa.user_id,
                                            tosa.is_primary,
                                            tosa.role_type,
                                            case when tu.first_name is null then null else
                                                    concat(tu.title,'. ', tu.first_name, ' ', tu.middle_name , ' ',tu.last_name) end staff_name ,
                                            tstd.school_term_detail_id,
                                            to2."sequence",
                                            tosa.org_staff_assignment_id 
                                            from t_organization to2
                                            left join t_organization_staff_assignment tosa on to2.org_id = tosa.org_id 
                                                    and tosa.is_deleted != true
                                                    and tosa.school_term_detail_id = $2
                                            left join t_user tu on tosa.user_id = tu.user_id 
                                            left join t_school_term_detail tstd on tosa.school_term_detail_id = tstd.school_term_detail_id 
                                            and tstd.school_term_detail_id = $2 
                                            where to2.org_id in (
                                                                (WITH recursive child_orgs 
                                                            AS (
                                                                SELECT org_id
                                                                FROM   t_organization parent_org 
                                                                WHERE  org_id = $1
                                                                UNION
                                                                SELECT     child_org.org_id child_id
                                                                FROM       t_organization child_org
                                                                INNER JOIN child_orgs c
                                                                ON         c.org_id = child_org.parent_org_id )
                                                                SELECT * FROM   child_orgs))
                                            and to2.is_deleted != true  order by to2."sequence";`;

                                                                                        

const getCurretTerm = ` select jsonb_agg(
                                    jsonb_build_object(
                                        'term', tstd.term_year,
                                        'startDate', tstd.term_start_date,
                                        'endDate', tstd.term_end_date,
                                        'termDtlId', tstd.school_term_detail_id 
                                    ) order by term_start_date
                                ) term_data from t_school_term_detail tstd
                                where current_date > term_start_date 
                                    and current_date < term_end_date
                                    and is_deleted != true;`                                            

const getParishesAndSchoolsByUserId = `select distinct to2.org_id, org_type, "name", parent_org_id, address_line1, address_line2, city
                                        "level"
                                        from t_organization to2 join  
                                        (WITH recursive child_orgs 
                                                                AS (
                                                                    SELECT org_id
                                                                    FROM   t_organization parent_org 
                                                                    WHERE  org_id IN
                                                                            (
                                                                                SELECT a.org_id
                                                                            FROM   t_user_role_context a, t_user b
                                                                            WHERE  b.user_id = $1
                                                                            AND    a.user_id = b.user_id  )                                                    
                                                                    UNION
                                                                    SELECT     child_org.org_id child_id
                                                                    FROM       t_organization child_org
                                                                    INNER JOIN child_orgs c
                                                                    ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                                        FROM   child_orgs) hyrq on to2.org_id  = hyrq.org_id
                                        where to2.org_type in ('Parish', 'Sunday School') order by "level"; `;


const getAllTerms = `select jsonb_agg(
                                jsonb_build_object(
                                    'term', tstd.term_year,
                                    'startDate', tstd.term_start_date,
                                    'endDate', tstd.term_end_date,
                                    'termDtlId', tstd.school_term_detail_id 
                                ) order by term_start_date
                            ) term_data from t_school_term_detail tstd
                            where is_deleted = false ;`                                        

// const getUserGrades = `select distinct to2.org_id, to2."name", to2."sequence" from t_organization_staff_assignment tosa
//                         join t_organization to2 on to2.org_id = tosa.org_id 
//                         join t_school_term_detail tstd on tosa.school_term_detail_id = tstd.school_term_detail_id 
//                         and current_date <= tstd.term_end_date and current_date >= tstd.term_start_date
//                         and tstd.is_deleted = false 
//                         where role_type = 'Sunday School Teacher'
//                         and user_id = $1 order by to2."sequence";`;           
                        
const getUserGrades = `select distinct to2.org_id, to2."name", to2."sequence" from t_organization_staff_assignment tosa
                            join t_school_term_detail tstd on tosa.school_term_detail_id = tstd.school_term_detail_id 
                            and current_date <= tstd.term_end_date and current_date >= tstd.term_start_date
                            and tstd.is_deleted = false 
                            join t_organization to2 on tosa.org_id = to2.org_id
                            join (WITH recursive child_orgs 
                                        AS (
                                            SELECT  org_id
                                            FROM   t_organization parent_org 
                                            WHERE  parent_org.parent_org_id = $1
                                            UNION
                                            SELECT     child_org.parent_org_id child_id
                                            FROM       t_organization child_org
                                            INNER JOIN child_orgs c
                                            ON         c.org_id = child_org.org_id )
                                            SELECT org_id FROM child_orgs) hquery
                            on hquery.org_id = to2.org_id
                            and to2.org_type = 'Grade'
                            where tosa.role_type = 'Sunday School Teacher'
                            and tosa.user_id = $2 order by to2."sequence";`;                   
                        
const getAllSchoolsOfTeacher = `select distinct to3."name", to3.org_id from t_organization_staff_assignment tosa 
                                join t_school_term_detail tstd on tosa.school_term_detail_id = tstd.school_term_detail_id 
                                    and current_date <= tstd.term_end_date and current_date >= tstd.term_start_date
                                    and tstd.is_deleted = false and tosa.user_id = $1 and tosa.role_type = 'Sunday School Teacher'
                                join t_organization to2 on to2.org_id = tosa.org_id
                                join t_organization to3 on to3.org_id = to2.parent_org_id;`;
                                
const getGradeWiseAttendance = `select distinct
                                        tstd.school_term_detail_id, 
                                        tstd.term_year, 
                                        tstd.term_start_date, 
                                        tstd.term_end_date,
                                        tssd.student_id,
                                        concat(tu.title,'. ', tu.first_name, ' ', tu.middle_name , ' ',tu.last_name) student_name,
                                        case when tssa.has_attended = true then true else false end has_attended
                                        from t_organization_staff_assignment tosa 
                                        join t_school_term_detail tstd on tosa.school_term_detail_id = tstd.school_term_detail_id 
                                        and current_date <= tstd.term_end_date and current_date >= tstd.term_start_date
                                        and tstd.is_deleted = false and tosa.user_id = $1
                                        join t_student_sundayschool_dtl tssd on tstd.school_term_detail_id = tssd.term_id
                                        join t_organization to2 on tssd.school_grade = to2."name" and tssd.school_id = $2
                                            and to2.org_id in (	(WITH recursive child_orgs 
                                                            AS (
                                                                SELECT  org_id
                                                                FROM   t_organization parent_org 
                                                                WHERE  parent_org.parent_org_id = $2
                                                                UNION
                                                                SELECT     child_org.parent_org_id child_id
                                                                FROM       t_organization child_org
                                                                INNER JOIN child_orgs c
                                                                ON         c.org_id = child_org.org_id )
                                                                SELECT org_id FROM child_orgs))
                                            and to2.org_id = $3
                                        left join t_sunday_school_attendace tssa on tssa.school_id =  $2
                                        and tssa.teacher_id =  $1 and tstd.school_term_detail_id  = tstd.school_term_detail_id 
                                        and tssd.student_id = tssa.student_id 
                                        and tssa.attendance_date = to_date($4, 'yyyy-mm-dd')
                                        and tssa.school_term_detail_id = tstd.school_term_detail_id 
                                        join t_user tu on tu.user_id = tssd.student_id order by student_name;`;     
                                        
const create_t_temp_attendance = `create temporary table t_temp_attendance(
                                            user_id int,
                                            has_attended bool
                                          );`;

const insertIntoAttendanceTempTbl = `INSERT INTO t_temp_attendance (user_id, has_attended)
                                        SELECT student_id, has_attended
                                        FROM jsonb_to_recordset($1::jsonb) AS t (student_id int, has_attended bool);`;     
                                        
const deleteExistingAttendance = `delete from t_sunday_school_attendace where sunday_school_attendace_id in(
                                    select tssa.sunday_school_attendace_id from t_temp_attendance tta 
                                    join t_sunday_school_attendace tssa on tssa.school_term_detail_id = $1
                                    and tta.user_id = tssa.student_id and tssa.attendance_date = to_date($4, 'yyyy-mm-dd')
                                    and tssa.school_id = $2 and tssa.grade_id = $3 and tssa.teacher_id = $5);`;       
                                    
const bulkInstetAttendance =     `INSERT INTO t_sunday_school_attendace
                                    (school_id, grade_id, teacher_id, student_id, school_term_detail_id, has_attended, attendance_date, created_by, created_date)
                                    (select $1, $2, $3, tta.user_id, $4, tta.has_attended, to_date( $5, 'yyyy-mm-dd'), $6, $7  
                                    from t_temp_attendance tta)`;                                    

const getCurrentTerm = `select 
                            jsonb_build_object(
                                'termDtlId', tstd.school_term_detail_id,
                                'termYear', tstd.term_year,
                                'termStartDate', tstd.term_start_date,
                                'termEndDate', tstd.term_end_date
                                ) current_term
                            from t_school_term_detail tstd
                            where current_date <= tstd.term_end_date 
                            and current_date >= tstd.term_start_date
                            and tstd.is_deleted = false;`;                                    

module.exports = {
    getGradeStaffAssBySchoolIdDefTerm,
    getGradeStaffAssBySchoolIdReqTerm,
    getCurretTerm,
    getParishesAndSchoolsByUserId,
    getAllTerms,
    getUserGrades,
    getAllSchoolsOfTeacher,
    getGradeWiseAttendance,
    create_t_temp_attendance,
    insertIntoAttendanceTempTbl,
    deleteExistingAttendance,
    bulkInstetAttendance,
    getCurrentTerm
}
