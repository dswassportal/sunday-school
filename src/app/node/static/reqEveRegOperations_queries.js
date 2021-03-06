

const getEventData = `select distinct te.event_id,
                        te."name" event_name,
                        te.event_type,
                        tepr.registration_status,
                        tepr.event_participant_registration_id,
                        tepr.enrollment_id,
                        tepr.user_id,
                        te.description,
                        tepr.role,
                        tepr.event_venue_id selected_event_venue_id,
                        tgg.grade_group_id,
                        tgg.group_name, 
                        te.start_date,
                        te.end_date,
                        te.registration_start_date,
                        te.registration_end_date,
                        te.event_url,
                        tea.attachment_name,
                        tea.attachment_type,
                        tea.event_attachment_id,
                        tea.file_name,
                        tv.venue_id,
                        case when tperc.event_category_id is null then false else true end has_cat_selected,
                        tv."name" venue_name,
                        tec."name" cat_name, 
                        tec.event_category_id,
                        tecm.event_cat_map_id,
                        tev.event_venue_id,
                        teq.question_id,
                        teq.question,
                        teq.answer_type,
                        teqr.answer ,
                        tec."sequence"  
                        from t_event te 
                        left join t_event_participant_registration tepr on tepr.event_id = te.event_id 
                            and tepr.user_id = $2 and tepr.event_id = $1 and tepr.is_deleted != true
                        left join t_event_attachment tea on tea.event_id = $1
                        left join t_event_venue tev on tev.event_id = $1
                        left join t_venue tv on tv.venue_id = tev.venue_id
                        left join t_event_category_map tecm on tecm.event_id = $1
                        left join t_event_category tec on tecm.event_category_id = tec.event_category_id
                        left join t_participant_event_reg_cat tperc 
                        	on tperc.event_participant_registration_id = tepr.event_participant_registration_id 
                            and  tecm.event_cat_map_id = tperc.event_category_id 
                        	and tperc.is_deleted != true
                        left join t_event_questionnaire teq on teq.event_id = $1
                        left join t_event_question_response teqr 
                        	on teqr.event_participant_registration_id = tepr.event_participant_registration_id 
                            and teq.question_id = teqr.question_id
                        left join t_grade_group tgg on tgg.grade_group_id =  tepr.grade_group_id
                        where te.event_id = $1 order by tec."sequence";`;

const getTTCEventData = `    select distinct
                                te.event_id,
                                te."name" event_name,
                                te.description,
                                te.registration_start_date, 
                                te.registration_end_date, 
                                te.start_date,
                                te.end_date,
                                tu.email_id,
                                    case when tu.first_name is null then null else concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ', tu.last_name) end user_name,
                                tp.mobile_no,
                                tepr.enrollment_id,
                                tepr.event_participant_registration_id,
                                tepr.registration_status,
                                    case when tepr.event_participant_registration_id is null then false 
                                    when tepr.event_participant_registration_id is not null and tepr.registration_status = 'Canceled' then false
                                    else true end  has_registered,
                                tepr.event_venue_id, 
                                tosa.role_type,
                                tosa.user_id,
                                array_agg(to2.name) org_name,
                                to2.org_type,
                                array_agg(to2.org_id) org_id,
                                to2.parent_org_id,
                                tv."name" venue_name,
                                tev.venue_id,
                                  case when tu2.first_name is null then null else concat(tu2.title,'. ',tu2.first_name,' ', tu2.middle_name, ' ', tu2.last_name) end registered_by,
                                tepr.created_date registered_on
                                from
                                t_organization to2
                                        join (WITH recursive child_orgs 
                                                            AS (
                                                                SELECT org_id
                                                                FROM   t_organization parent_org 
                                                                WHERE  org_id IN
                                                                        (
                                                                            SELECT a.org_id
                                                                        FROM   t_user_role_context a, t_user b
                                                                        WHERE  b.user_id = $1 
                                                                        and a.is_deleted = false 
                                                                        and b.is_approved = true 
                                                                        and b.is_deleted = false
                                                                        AND    a.user_id = b.user_id  )                                                    
                                                                UNION
                                                                SELECT     child_org.org_id child_id
                                                                FROM       t_organization child_org
                                                                INNER JOIN child_orgs c
                                                                ON         c.org_id = child_org.parent_org_id ) SELECT *
                                            FROM   child_orgs) hir_query on hir_query.org_id = to2.org_id
                                             left join t_organization_staff_assignment tosa on hir_query.org_id = tosa.org_id 
                                                 and tosa.is_deleted = false                           
                                            left join t_school_term_detail tstd  on tstd.school_term_detail_id = tosa.school_term_detail_id
                                                and current_date <= tstd.term_end_date and current_date >= tstd.term_start_date
                                                and tstd.is_deleted = false
                                            join t_event te on te.event_id = $2 	
                                            left join t_event_participant_registration tepr on tepr.user_id = tosa.user_id
                                                and tepr.is_deleted = false and tepr.event_id = $2
                                            left join t_user tu on tu.user_id = tosa.user_id 
                                                and tu.is_approved = true 
                                                and tu.is_deleted = false
                                            left join t_person tp on tp.user_id = tosa.user_id
                                            left join t_user tu2 on tu2.user_id = tepr.created_by 
                                            left join t_event_venue tev on tepr.event_venue_id  = tev.event_venue_id 
                                            left join t_venue tv on tev.venue_id  = tv.venue_id 
                                            group by  te.event_id,  tu.email_id, tu.first_name,
                                                tu.title, tu.middle_name, tu.last_name, tp.mobile_no,  tepr.enrollment_id,
                                                tepr.event_participant_registration_id, to2.org_type,
                                                tepr.registration_status,  tosa.role_type, tosa.user_id, to2.parent_org_id,
                                                tu2.title, tu2.first_name, tu2.middle_name, tu2.last_name, tv."name", tev.venue_id;`

// const getPrincipalwiseStudentsData = `select distinct * from t_student_sundayschool_dtl tssd
//                          join t_user tu on tu.user_id = tssd.student_id
//                          where tssd.school_id IN (select org_id from t_organization_staff_Assignment where role_type = 'Sunday School Principal' and user_id= $1 );`;


const getPrincipalwiseStudentsData = `select distinct  tssd.student_id, tssd.school_grade,
tosa2.user_id as "teacher_user_id",
concat(tu1.title,'. ',tu1.first_name,' ', tu1.middle_name, ' ', tu1.last_name) as "teacher_name",
tssd.term_id ,
to2.name as "school_name", 
tssd.school_id,
concat(tu.title, '. ', tu.first_name, ' ', tu.middle_name, ' ', tu.last_name) as "student_name",
tosa.user_id as "principal_user_id",
tepr.event_participant_registration_id,
case when tepr.registration_status is null or tepr.registration_status = 'Canceled' then false else true end has_selected,
tepr.enrollment_id,
tepr.registration_status,
case when tu2.title is not null then concat(tu2.title,'. ',tu2.first_name,' ', tu2.middle_name, ' ', tu2.last_name) 
else null end registered_by,
case when tepr.updated_date is null then tepr.created_date else tepr.updated_date end registered_on
from t_student_sundayschool_dtl tssd
    join t_organization torg on torg.parent_org_id = tssd.school_id and tssd.school_grade = torg."name" 
    join t_organization to2 on to2.org_id = torg.parent_org_id 
    join t_user tu on tu.user_id = tssd.student_id 
    join t_organization_staff_Assignment tosa on tosa.org_id = tssd.school_id 
           and tosa.is_deleted = false and tosa.is_primary = true and tosa.role_type in ('Sunday School Principal', 'Sunday School Vice Principal')
    join t_school_term_detail tstd1  on tosa.school_term_detail_id  = tstd1.school_term_detail_id  
        and CURRENT_DATE > tstd1.term_start_date  
        and CURRENT_DATE < tstd1.term_end_date
     join t_organization_staff_Assignment tosa2 on tosa2.org_id = torg.org_id	
            and tosa2.is_deleted = false and tosa2.is_primary = true and tosa2.role_type = 'Sunday School Teacher'
            and tosa2.school_term_detail_id = tosa.school_term_detail_id 	
    join t_user tu1 on tu1.user_id = tosa2.user_id 
    left join t_event_participant_registration tepr on tepr.user_id = tssd.student_id
    and tepr.event_id = $2
    left join t_user tu2 on tu2.user_id = tepr.created_by
where tosa.user_id = $1;`;


const getTeacherwiseStudentData = `     select distinct tosa.user_id as "teacher_user_id", torg.name as "school_grade", tssd.school_id, tssd.student_id, torg1.name as "school_name",
concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ', tu.last_name) as "student_name",
tepr.event_participant_registration_id,
case when tepr.registration_status is null or tepr.registration_status = 'Canceled' then false else true end has_selected,
tepr.enrollment_id,
tepr.registration_status,
case when tu2.title is not null then concat(tu2.title,'. ',tu2.first_name,' ', tu2.middle_name, ' ', tu2.last_name) 
    else null end registered_by,
case when tepr.updated_date is null then tepr.created_date else tepr.updated_date end 
registered_on
from t_organization_staff_Assignment tosa 
join t_organization torg on tosa.org_id = torg.org_id
join t_student_sundayschool_dtl tssd on tssd.school_grade = torg.name and tssd.school_id = torg.parent_org_id 
join t_organization torg1 on torg1.org_id = tssd.school_id
join t_user tu on tu.user_id = tssd.student_id
left join t_event_participant_registration tepr on tepr.user_id = tssd.student_id
and tepr.event_id = $2
left join t_user tu2 on tu2.user_id = tepr.created_by 
where tosa.role_type = 'Sunday School Teacher' and tosa.user_id = $1 order by tssd.school_id;`;


const getParticipantRolesFormLookup = `select jsonb_agg(
                                            jsonb_build_object(
                                                'roleDesc', tl.description,
                                                'code', tl.code 
                                                ) order by "sequence"
                                            ) parti_role
                                        from t_lookup tl where "type" = 'Participant Role' 
                                        and is_deleted != true;`;

const getEventSectionConfigByEveType = `select
                                            jsonb_build_object(
                                                'eventTypeId', tet.event_type_id,
                                                'eventType', tet.name,
                                                'isVenueRequired', tet.is_venue_required,
                                                'isProctorRequired', tet.is_proctor_required,
                                                'isJudgeRequired', tet.is_judge_required,
                                                'isSchoolGradeRequired', tet.is_school_grade_required,
                                                'isCategoryRequired', tet.is_category_required,
                                                'isSingleDayEvent', tet.is_single_day_event,
                                                'isSchoolGroupRequired', tet.is_school_group_required,
                                                'isEvaluatorRequired', tet.is_evaluator_required,
                                                'isQuestionnaireRequired', tet.is_questionnaire_required,
                                                'isAttachmentRequired', tet.is_attachment_required,
                                                'isUrlRequired', tet.is_url_required
                                            ) event_sec_config
                                            from t_event_type tet where tet."name" = 
                                                (select te.event_type from t_event te where event_id = $1)
                                            and tet.is_deleted != true;`;

const checkGeneratedEnrollmentNoExists = `select case when count(enrollment_id) = 0 then false
                                            else true end ran_no from t_event_participant_registration 
                                            where enrollment_id =$1;`

const newRegistration = `INSERT INTO t_event_participant_registration
                            (event_id, user_id, grade_group_id, is_deleted, created_by, created_date, enrollment_id, event_venue_id, registration_status, role)
                            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning event_participant_registration_id;`

const insertRegCatMapping = `INSERT INTO t_participant_event_reg_cat
                            (event_participant_registration_id, event_category_id, user_id, is_deleted, created_by, created_date)
                            VALUES $1 returning participant_event_reg_cat_id;`;

const insertRegQueResp = `INSERT INTO t_event_question_response
                            (event_participant_registration_id, question_id, answer, created_by, created_date)
                            VALUES $1  returning question_response_id;`;

const updateEventRegistration = `UPDATE t_event_participant_registration
                            SET updated_by=$1, updated_date=$2, event_venue_id=$3, registration_status=$4, role=$5, grade_group_id=$6 
                            WHERE event_participant_registration_id=$7;`;

const updateEventRegCatMapping = `INSERT INTO t_participant_event_reg_cat(event_participant_registration_id, event_category_id, user_id, is_deleted, updated_by, updated_date)               
                                    SELECT $1, $2, $3, $4, $5, $6 
                                    WHERE NOT EXISTS (
                                        SELECT 1 FROM t_participant_event_reg_cat  
                                                                WHERE event_participant_registration_id = $1
                                                                and event_category_id = $2
                                                                and user_id = $3
                                                                and is_deleted != true
                                                                ) returning participant_event_reg_cat_id;`;

const deleteCatMapping = `update t_participant_event_reg_cat 
                                set is_deleted= $1, updated_by= $2, updated_date= $3 
                                where event_participant_registration_id= $4 and event_category_id not in ($5) returning participant_event_reg_cat_id;`;

const updateRegQuestionRes = `UPDATE t_event_question_response
                                SET answer=$1, updated_by=$2, updated_date=$3
                                WHERE event_participant_registration_id=$4 and question_id=$5 returning question_response_id;`;


// const getFamTreeWithEventRegStatus = `with family_tree as (select family_member_id user_id, relationship  
//                                     from t_person_relationship tpr 
//                                     where tpr.family_head_id = $2
//                                     and is_deleted != true
//                                     union select $2, 'Family Head'
//                                     )
//                                     select distinct vu.user_id, 
//                                     tepr.event_participant_registration_id,
//                                     case when tepr.event_participant_registration_id is not null then true else false end has_registred,
//                                     concat(vu.title,'. ',vu.first_name,' ', vu.middle_name, ' ', vu.last_name) "name",
//                                     tepr.registration_status, 
//                                     ft.relationship from v_user vu
//                                     join family_tree ft on vu.user_id = ft.user_id
//                                     left join t_event_participant_registration tepr on tepr.user_id = ft.user_id
//                                     and tepr.event_id = $1 where vu.is_approved != false;`;



const getFamTreeWithEventRegStatus = `with family_tree as (                    
                                    select tpf.family_member_id user_id, tpf.relationship 
                                    from t_person_family tpf
                                    where family_id = (select family_id from t_person tp where user_id = $2)
                                    and tpf.is_deleted = false
                                    )
                                    select distinct vu.user_id, 
                                        tepr.event_participant_registration_id,
                                        case when tepr.event_participant_registration_id is not null then true else false end has_registred,
                                        concat(vu.title,'. ',vu.first_name,' ', vu.middle_name, ' ', vu.last_name) "name",
                                        tepr.registration_status, 
                                        ft.relationship 
                                    from v_user vu
                                        join family_tree ft on vu.user_id = ft.user_id
                                        left join t_event_participant_registration tepr on tepr.user_id = ft.user_id and tepr.event_id = $1 
                                    where vu.user_id != $2 and vu.is_approved != false
                                union
                                    select distinct vu.user_id, 
                                        tepr.event_participant_registration_id,
                                        case when tepr.event_participant_registration_id is not null then true else false end has_registred,
                                        concat(vu.title,'. ',vu.first_name,' ', vu.middle_name, ' ', vu.last_name) "name",
                                        tepr.registration_status, 
                                        null relationship
                                    from v_user vu
                                    left join t_event_participant_registration tepr on tepr.user_id = vu.user_id and tepr.event_id = $1 
                                    where vu.user_id = $2 and vu.is_approved != false;`;

const getVicarDetails = `select distinct 
                        concat(tu2.title,'. ',tu2.first_name,' ', tu2.middle_name, ' ', tu2.last_name) user_name,
                        tu2.user_id 
                        from t_role tr join t_user_role_context turc 
                        on turc.role_id = tr.role_id and tr."name" = 'Vicar'
                        and tr.is_deleted = false and turc.is_deleted = false 
                        join t_user tu on tu.org_id = turc.org_id and tu.user_id = $1
                        join t_user tu2  on turc.user_id = tu2.user_id;`;

const getVenuesByEventId = `select distinct event_venue_id, name from t_event_venue tev 
                                join t_venue tv on tev.venue_id = tv.venue_id and event_id = $1;`;

const bulkInsertNewRegistration = `INSERT INTO t_event_participant_registration
                                    (event_id, user_id, grade_group_id, is_deleted, created_by, created_date, enrollment_id, event_venue_id, registration_status, role)
                                    VALUES $1 returning event_participant_registration_id;`;

const updateTTCRegistration = `	UPDATE t_event_participant_registration
                                SET updated_by=$1, updated_date=$2, event_venue_id=$3, registration_status=$4
                                WHERE event_participant_registration_id in ($5) returning event_participant_registration_id`;

const cancelTTCRegistation = `UPDATE t_event_participant_registration
                                SET updated_by=$1, updated_date=$2, registration_status=$3
                                WHERE event_id= $4 and user_id in ($5) returning event_participant_registration_id;`;

const getGradeGroups = `select distinct te.event_id, te."name", tgg.group_name, tgg.grade_group_id
                            from t_student_sundayschool_dtl tssd 
                            join t_school_term_detail tstd on tssd.term_id = tstd.school_term_detail_id 
                                and current_date <= tstd.term_end_date and current_date >= tstd.term_start_date
                            join t_grade_group_detail tggd on tggd.grade = tssd.school_grade and tssd.student_id = $2
                            join t_event_grade_group_map teggm on teggm.grade_group_id = tggd.grade_group_id 
                            join t_grade_group tgg on tgg.grade_group_id = teggm.grade_group_id
                            join t_event te on teggm.event_id = te.event_id and te.event_id = $1;`;


module.exports = {
    getEventData,
    getParticipantRolesFormLookup,
    getEventSectionConfigByEveType,
    checkGeneratedEnrollmentNoExists,
    newRegistration,
    insertRegCatMapping,
    insertRegQueResp,
    updateEventRegistration,
    updateEventRegCatMapping,
    deleteCatMapping,
    updateRegQuestionRes,
    getFamTreeWithEventRegStatus,
    getTTCEventData,
    getVicarDetails,
    getVenuesByEventId,
    bulkInsertNewRegistration,
    updateTTCRegistration,
    cancelTTCRegistation,
    getGradeGroups,
    getPrincipalwiseStudentsData,
    getTeacherwiseStudentData
}


