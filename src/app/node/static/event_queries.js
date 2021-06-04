/*----------------  This files contains all SQL queries related to event creation, Updation, Deletion  ----------------- */


const insertEvent = `INSERT INTO t_event 
                                (name, event_type, description, start_date, 
                                end_date, registration_start_date, registration_end_date, created_by, created_date, event_url) 
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning event_id;`;


const updateEvent = `UPDATE t_event
                     SET "name"=$1, event_type=$2, description=$3, start_date=$4, end_date=$5,
                                 registration_start_date=$6, registration_end_date=$7, updated_by=$8, updated_date=$9, event_url = $10
                     WHERE event_id = $11;`;

const insertEventOrgs = `INSERT INTO t_event_organization(event_id, org_type, org_id) VALUES($1, $2, $3) returning event_organization_id;`;

const deleteEventOrgs = `DELETE FROM t_event_organization where event_id = $1;`

const insertEventCords = `INSERT INTO t_event_coordinator (event_id, user_id, created_by, created_date) 
                          VALUES($1, $2, $3, $4) returning event_coordinator_id;`;

const deleteEventCords = `DELETE FROM t_event_coordinator where event_id = $1;`

// const insertCatMap = `INSERT INTO t_event_category_map(event_id, event_category_id)
//                             VALUES ($1, $2) returning event_cat_map_id;`

const insertCatMap = `INSERT INTO t_event_category_map (event_id, event_category_id)
                        select $1, $2
                        WHERE NOT EXISTS (
                        SELECT 1 FROM t_event_category_map turm 
                                            WHERE event_id = $1
                                            and event_category_id = $2
                                    ) returning event_cat_map_id;`

const getFrststEveTypIdByEveTyp = `select event_type_id from t_event_category where lower(type) = lower($1) fetch first 1 row only;`;

const insertNewCategory = `INSERT INTO t_event_category
                                    ("name", description, "type", event_type_id, "sequence")
                           VALUES($1, $2, $3,
                            (select event_type_id from t_event_category where lower(type) = lower($4) fetch first 1 row only),
                            (select max("sequence") + 1 seq_max_count from t_event_category tec where lower("type") = lower($4))
                            ) returning event_category_id;`;

const insertGradeGroupMapping = `INSERT INTO t_event_grade_group_map(event_id, grade_group_id, created_by, created_date)
                                    select $1, $2, $3, $4
                                    WHERE NOT EXISTS (
                                    SELECT 1 FROM t_event_grade_group_map teggm 
                                                        WHERE teggm.event_id = $1
                                                        and teggm.grade_group_id = $2
                                                ) returning event_grade_group_map_id;`

const insertGradeGroup = `insert into t_grade_group (group_name, created_by, created_date, "sequence") 
                            values ($1, $2, $3, (select max("sequence") + 1 seq_max_count from t_grade_group)
                                ) returning grade_group_id;`;

const insertGradeGroupDtl = `insert into t_grade_group_detail ( grade_group_id, grade ) values ($1, $2);`;

const getSelecedAndAllCats = `WITH staff_mapping_check AS (
                                                select distinct tecsm.event_category_map_id
                                                from t_event_cat_staff_map tecsm 
                                                right join t_event_category_map tecm on tecsm.event_category_map_id = tecm.event_cat_map_id 
                                                where tecsm.event_id = $1 and tecm.event_id = $1 and tecsm.is_deleted = false
                                        ), grade_mapping_check AS (
                                                select  distinct tecm.event_cat_map_id 
                                                from t_event_category_map tecm
                                                join t_event_cat_grade_grp_map tecggmt on tecm.event_cat_map_id = tecggmt.event_cat_map_id 
                                                where tecm.event_id = $1 and tecggmt.is_deleted = false
                                        ), participant_enrollment_check as (
                                                select distinct tecm.event_cat_map_id from t_event_category_map tecm 
                                                join t_participant_event_reg_cat tperc on tecm.event_category_id = tperc.event_category_id
                                                join t_event_participant_registration tepr on tepr.event_participant_registration_id = tperc.event_participant_registration_id
                                                and tepr.event_id = $1 and tepr.is_deleted = false
                                        )
                                        select  
                                        jsonb_agg(
                                               jsonb_build_object(
                                                    'catId', tec.event_category_id,
                                                    'catName', tec."name", 
                                                    'catDesc', tec.description,
                                                    'catMapId', tecm.event_cat_map_id,
                                                    'isSelected', case when tecm.event_cat_map_id is null then false else true end,
                                                    'hasJudgeMapped', case when smc.event_category_map_id is null then false else true end ,
                                                    'hasGradeMapped', case when gmc.event_cat_map_id is null then false else true end , 
                                                    'hasParticipant', case when pec.event_cat_map_id is null then false else true end,
                                                    'sequence', tec."sequence"
                                                    ) ORDER BY tec."sequence" 
                                            ) event_cats 
                                        from t_event_category tec
                                        left join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id  and tecm.event_id = $1
                                        left join staff_mapping_check smc on tecm.event_cat_map_id = smc.event_category_map_id
                                        left join grade_mapping_check gmc on gmc.event_cat_map_id = tecm.event_cat_map_id
                                        left join participant_enrollment_check pec on  pec.event_cat_map_id = tecm.event_cat_map_id
                                        where lower(tec."type") = lower($2);`;

const getSelectedAndAllGroups = `select 
                                    jsonb_agg(
                                        jsonb_build_object(
                                            'gradeGroupName', tgg.group_name,
                                            'gradeGroupId', tgg.grade_group_id,
                                            'eventGradeGroupMapId', teggm.event_grade_group_map_id,
                                            'grades', (select ARRAY_AGG (tggd.grade) 
                                                    from  t_grade_group_detail tggd
                                                    where tggd.grade_group_id = tgg.grade_group_id),
                                            'isSelected', case when teggm.event_grade_group_map_id is null then false else true end,
                                            'hasMappedToCat', case when tecggmt.event_cat_grade_grp_map_id is null then false else true end,
                                            'sequence', tgg."sequence" 
                                        ) order by tgg."sequence" 
                                    ) selected_and_all_grades
                                    from t_grade_group tgg 
                                    left join t_event_grade_group_map teggm on tgg.grade_group_id = teggm.grade_group_id and teggm.event_id = $1
                                    left join  t_event_cat_grade_grp_map tecggmt on teggm.event_grade_group_map_id = tecggmt.event_cat_grade_grp_map_id `;

const getEventGroupMapping = `select 
                                    jsonb_agg(
                                        jsonb_build_object(
                                            'gradeGroupName', tgg.group_name,
                                            'gradeGroupMapId', teggm.event_grade_group_map_id,
                                            'gradeGroupId', tgg.grade_group_id
                                            ) order by tgg."sequence"
                                    ) group_mapping 
                                    from t_grade_group tgg 
                                    join t_event_grade_group_map teggm 	
                                    on tgg.grade_group_id = teggm.grade_group_id and teggm.event_id = $1;`;

const getEventCatMapping = `select
                                jsonb_agg(
                                jsonb_build_object(
                                    'catName', tec."name",
                                    'catMapId', tecm.event_cat_map_id,
                                    'catId', tec.event_category_id 
                                    ) order by tec."sequence" 
                                ) cat_mapping
                                from t_event_category tec 
                                join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                                and tecm.event_id = $1;`;

const insertCatGradeMapping = `INSERT INTO t_event_cat_grade_grp_map(event_cat_map_id, event_grade_group_map_id, created_by, created_date)
                                        select $1, $2, $3, $4
                                        WHERE NOT EXISTS (
                                        SELECT 1 FROM t_event_cat_grade_grp_map tecggm
                                                            WHERE tecggm.event_cat_map_id = $1
                                                            and tecggm.event_grade_group_map_id = $2
                                                            and tecggm.is_deleted = false
                                                    ) returning event_cat_grade_grp_map_id;`;


const getVenusAllDetailsByEventLevel = `select jsonb_agg(
                                        jsonb_build_object(
                                        'venueId', tv.venue_id,
                                        'venueName', tv."name",
                                        'addressLine1', tv.address_line1,
                                        'addressLine2', tv.address_line2,
                                        'addressLine3', tv.address_line3,
                                        'city', tv.city,
                                        'country', tv.country,
                                        'postalCode', tv.postal_code,
                                        'mobileNo', tv.mobile_no,
                                        'phoneNo', tv.phone_no,
                                        'mapUrl', tv.map_url,
                                        'eventVenueMapId', tev.event_venue_id,
                                        'isSelected', case when tev.event_venue_id is null then false else true end,
                                        'hasProctor', case when tev.proctor_id is null then false else true end 
                                        ) 
                                    ) venue_list from t_venue tv 
                                   left join t_event_venue tev on tv.venue_id  = tev.venue_id and tev.event_id  = $1
                                    where tv.is_deleted = false and tv.org_id in 
                                    (select org_id from t_organization to2 where org_type = 'Parish' and to2.is_deleted = false and to2.org_id in
                                            (WITH recursive child_orgs 
                                                                    AS (
                                                                        SELECT org_id
                                                                        FROM   t_organization parent_org 
                                                                        WHERE  org_id in (select org_id from t_event_organization teo 
                                                                                            where teo.event_id = $1)                                                  
                                                                        UNION
                                                                        SELECT     child_org.org_id child_id
                                                                        FROM       t_organization child_org
                                                                        INNER JOIN child_orgs c
                                                                        ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                                            FROM   child_orgs));`;

const insertVenueEventMapping = ` insert into t_event_venue ( event_id, venue_id ) 
                                    select $1, $2
                                    WHERE NOT EXISTS (
                                    SELECT 1 FROM t_event_venue tev
                                                        WHERE tev.event_id = $1
                                                        and tev.venue_id = $2
                                                ) returning event_venue_id;`


const getProctorsByEventId = `select 
                                jsonb_agg(
                                    distinct  jsonb_build_object(
                                                    'name', concat(tu.title,'. ', tu.first_name ,' ', tu.middle_name,' ', tu.last_name),
                                                    'proctorId', tu.user_id,
                                                    'venueName', tv."name",
                                                    'venueId', tev.venue_id,
                                                    'eventVenueMapId', tev.event_venue_id
                                                    ) 
                                ) proctor_data
                                from t_user tu
                                left join t_event_venue tev on  tu.user_id = tev.proctor_id  and event_id = $1 
                                and tev.is_deleted = false
                                left join t_venue tv on tv.venue_id = tev.venue_id and tv.is_deleted = false
                                join t_user_role_context turc on turc.user_id = tu.user_id and turc.is_deleted = false 
                                and turc.org_id in (            
                                                (WITH recursive child_orgs 
                                                AS (
                                                    SELECT org_id
                                                    FROM   t_organization parent_org 
                                                    WHERE  org_id in (select org_id from t_event_organization teo 
                                                                        where teo.event_id = $1)                                                  
                                                    UNION
                                                    SELECT     child_org.org_id child_id
                                                    FROM       t_organization child_org
                                                    INNER JOIN child_orgs c
                                                    ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                        FROM   child_orgs))
                                        and turc.role_id in (select tr.role_id from t_role tr 
                                        where lower(tr.name) like lower($2))
                                join t_user_role_mapping turm on turc.user_id = turm.user_id 
                                and coalesce(turm.role_start_date, current_date) <= current_date 
                                and coalesce(turm.role_end_date , current_date) >= current_date	`

const getVenusNameAndIsByEventLevel = `select jsonb_agg(
                                            jsonb_build_object(
                                            'venueId', tv.venue_id,
                                            'venueName', tv."name",
                                            'eventVenueMapId', tev.event_venue_id,
                                        'mappedProctor', json_build_object(
                                                'name', case when tu.title is null then null else 
                                                            concat(tu.title,'. ', tu.first_name ,' ', tu.middle_name,' ', tu.last_name) end ,
                                                'proctorId', tu.user_id
                                                ) 
                                            ) ) venue_list
                                        from t_venue tv 
                                        join t_event_venue tev on tv.venue_id  = tev.venue_id and tev.event_id = $1
                                        and tev.is_deleted = false
                                        left join t_user tu on tev.proctor_id = tu.user_id
                                        where tv.is_deleted = false and tv.org_id in 
                                        (select org_id from t_organization to2 where org_type = 'Parish' and to2.is_deleted = false and to2.org_id in
                                                (WITH recursive child_orgs 
                                                                        AS (
                                                                            SELECT org_id
                                                                            FROM   t_organization parent_org 
                                                                            WHERE  org_id in (select org_id from t_event_organization teo 
                                                                                                where teo.event_id = $1)                                                  
                                                                            UNION
                                                                            SELECT     child_org.org_id child_id
                                                                            FROM       t_organization child_org
                                                                            INNER JOIN child_orgs c
                                                                            ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                                                FROM   child_orgs));`;

const updateVenueProctorMapping = `update t_event_venue set proctor_id = $1 
                                    where event_id = $2
                                    and event_venue_id = $3 returning event_venue_id;`;

const getRegionsByEventId = `select jsonb_agg(
                                distinct  jsonb_build_object(
                                                'regionId', org_id,
                                                'regionName', name 
                                    ) 
                                ) region_array 
                            from t_organization to2 
                            where to2.org_type = 'Region' 
                            and is_deleted = false 
                            and to2.org_id in (  
                                    (WITH recursive child_orgs 
                                            AS (
                                                    SELECT org_id
                                                    FROM   t_organization parent_org 
                                                    WHERE  org_id in (select org_id from t_event_organization teo 
                                                                        where teo.event_id = $1)                                                  
                                                    UNION
                                                    SELECT     child_org.org_id child_id
                                                    FROM       t_organization child_org
                                                    INNER JOIN child_orgs c
                                                    ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                 FROM   child_orgs))`;

const getJudgesByEventRegion = `select 
                                jsonb_agg(
                                    jsonb_build_object(
                                        'judgeName',  concat(ve.title,'. ', ve.first_name ,' ', ve.middle_name,' ', ve.last_name,
                                        '(',
                                  		(select distinct user_org from v_user where user_id = ve.user_id)
                                  		,')'),
                                        'judgeId', ve.user_id
                                        ) 
                                    ) judge_list
                                from v_user ve where lower(ve.role_name) like lower($2) and org_id in ((WITH recursive child_orgs 
                                                AS (
                                                    SELECT org_id
                                                    FROM   t_organization parent_org 
                                                    WHERE  org_id = $1                                                   
                                                    UNION
                                                    SELECT     child_org.org_id child_id
                                                    FROM       t_organization child_org
                                                    INNER JOIN child_orgs c
                                                    ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                        FROM   child_orgs));`;

const insertRegionStaffMapping = ` INSERT INTO t_event_region_staff_map (event_id, event_category_id, 
                                            event_category_map_id, org_id, created_by, created_date)
                                    select $1, $2, $3, $4, $5, $6  
                                    WHERE NOT EXISTS (
                                    SELECT 1 FROM t_event_region_staff_map tersm 
                                                        WHERE tersm.event_id = $1 
                                                        and tersm.event_category_id = $2
                                                        and tersm.event_category_map_id = $3
                                                        and tersm.org_id = $4 
                                                        and tersm.is_deleted = false
                                                        ) returning event_region_staff_map_id;`;


const insertCatStaffMapId = ` INSERT INTO t_event_cat_staff_map (event_id, event_category_map_id, user_id, 
                                        role_type, created_by, created_date, event_region_staff_map_id)
                                select $1, $2, $3, $4, $5, $6, $7
                                WHERE NOT EXISTS (
                                SELECT 1 FROM t_event_cat_staff_map tersm 
                                                    WHERE tersm.event_id = $1 
                                                    and tersm.event_category_map_id = $2
                                                    and tersm.user_id = $3 
                                                    and tersm.is_deleted = false
                                                    ) returning event_cat_staff_map_id;`;

const getQuestionTypesFromLookup = `select tl.code 
                                    from t_lookup tl 
                                    where tl."type" = 'Question Type' 
                                    and tl.is_deleted = false 
                                    order by tl."sequence" ;`

const insertQuestionnaire = ` INSERT INTO t_event_questionnaire (event_id, question, answer_type, created_by, created_date)
                            SELECT $1, $2, $3, $4, $5
                            WHERE NOT EXISTS (
                            SELECT 1 FROM t_event_questionnaire teq
                                                    WHERE teq.event_id = $1 
                                                    and teq.question = '$2'
                                                    and teq.answer_type = '$3' 
                                                    and teq.is_deleted = false) returning question_id;`;

const getSelCatsCGmapSection = `select 
                                    tgg.group_name,
                                    teggm.event_grade_group_map_id,
                                    tgg.grade_group_id,
                                    tecggm.event_cat_map_id,
                                    tecm.event_category_id 
                                    from t_grade_group tgg 
                               join t_event_grade_group_map teggm 	
                               on tgg.grade_group_id = teggm.grade_group_id and teggm.event_id = $1
                               left join t_event_cat_grade_grp_map tecggm 
                               on tecggm.event_grade_group_map_id = teggm.event_grade_group_map_id
                               join t_event_category_map tecm on tecm.event_cat_map_id = tecggm.event_cat_map_id
                               where tecggm.is_deleted = false order by tgg."sequence";`;

const deleteCategoryMapping = `delete from t_event_category_map where event_id = $1 and event_cat_map_id not in ($2);`;

const deleteGroupMapping =  `delete from t_event_grade_group_map where event_id = $1 and event_grade_group_map_id not in ($2);`; 

const deleteCatGroupMapping = `UPDATE t_event_cat_grade_grp_map SET is_deleted = $1, updated_by = $2, updated_date = $3 
                                WHERE event_cat_map_id in ($4);`

const deleteVenues = `delete from t_event_venue WHERE event_id = $1 and venue_id not in ($2);`;        

const getJudgeMapForAssSec = `select distinct  
                            tecm.event_category_id cat_id,
                            tec."name" cat_name,
                            tecm.event_cat_map_id cat_map_id,
                            concat(tu.title,'. ', tu.first_name, ' ', tu.middle_name , ' ',tu.last_name,'(',to2."name" ,')') judge_name,
                            tersm.org_id,
                            tu.user_id ,
                            to3."name" region_name,
                            tec."sequence" 
                            from t_event_category_map tecm
                            join t_event_category tec on tecm.event_category_id = tec.event_category_id 
                            join t_event_cat_staff_map tecsm on tecm.event_cat_map_id = tecsm.event_category_map_id
                            join t_event_region_staff_map tersm on tersm.event_region_staff_map_id = tecsm.event_region_staff_map_id 
                            join t_user tu on tecsm.user_id = tu.user_id
                            join t_organization to2 on to2.org_id = tu.org_id 
                            join t_organization to3 on to3.org_id = tersm.org_id  
                            where tecm.event_id = $1 and tecsm.event_id = $1
                            and tecsm.is_deleted = false and tersm.is_deleted = false
                            order by tec."sequence", tersm.org_id;`;


const getDefinedQuestionnaire = `select question_id, question, answer_type from t_event_questionnaire teq 
                             where event_id = $1 and is_deleted = false order by question_id;`;

const deleteDefinedQuestions = `UPDATE t_event_questionnaire SET  is_deleted = $1, updated_by = $2, updated_date = $3
                                WHERE event_id = $4 and question_id not in ($5);`; 

const updateQueStmtAndResType = `UPDATE t_event_questionnaire
                                SET question = $1, answer_type = $2 , updated_by = $3, updated_date = $4
                                WHERE  event_id = $5 and question_id = $6;`; 
                                
const deleteStaffRegionMapping = `update t_event_region_staff_map set is_deleted= $1 ,updated_by= $2, updated_date= $3 where event_id = $4;`;

const deleteStaffCatMapping = `update t_event_cat_staff_map set is_deleted= $1, updated_by= $2, updated_date= $3 where event_id = $4;`;

const getSelectedAndAllEvaluators = `select jsonb_agg(
                                        jsonb_build_object(
                                            'evalName', concat(ve.title,'. ', ve.first_name ,' ', ve.middle_name,' ', ve.last_name,
                                                        '(',
                                                        (select distinct user_org from v_user where user_id = ve.user_id)
                                                        ,')'),
                                        'evalId', ve.user_id,
                                            'eventEvaluatorId', tee.event_evaluator_id,
                                            'isSelected', case when tee.event_evaluator_id is null then false else true end
                                            )
                                        ) evaluators
                                    from v_user ve 
                                    left join t_event_evaluator tee on tee.user_id = ve.user_id and event_id = $1
                                    where lower(ve.role_name) like lower($2) and org_id in ((WITH recursive child_orgs 
                                                    AS (
                                                        SELECT org_id
                                                        FROM   t_organization parent_org 
                                                        WHERE  org_id in ( select org_id from t_event_organization teo where event_id = $1)                                                   
                                                        UNION
                                                        SELECT     child_org.org_id child_id
                                                        FROM       t_organization child_org
                                                        INNER JOIN child_orgs c
                                                        ON         c.org_id = child_org.parent_org_id ) SELECT *
                                                            FROM   child_orgs));`;

const insertEventEvaluator = `INSERT INTO t_event_evaluator (event_id, user_id, created_by, created_date)
                                select $1, $2, $3, $4  
                                WHERE NOT EXISTS (
                                SELECT 1 FROM t_event_evaluator turm 
                                                    WHERE event_id = $1 
                                                    and user_id = $2
                                                    and is_deleted = false) returning event_evaluator_id;`;             
                                                    
 const deleteEvaluatorsForEvalSection = ` UPDATE t_event_evaluator
                                    SET is_deleted= $1, updated_by= $2, updated_date= $3
                                    WHERE event_id = $4 and event_evaluator_id not in ($5);`;                                                   

module.exports = {
    insertEvent,
    updateEvent,
    insertEventOrgs,
    deleteEventOrgs,
    insertEventCords,
    deleteEventCords,
    insertCatMap,
    getFrststEveTypIdByEveTyp,
    insertNewCategory,
    insertGradeGroupMapping,
    insertGradeGroup,
    insertGradeGroupDtl,
    getSelecedAndAllCats,
    getSelectedAndAllGroups,
    getEventGroupMapping,
    getEventCatMapping,
    insertCatGradeMapping,
    getVenusAllDetailsByEventLevel,
    insertVenueEventMapping,
    getProctorsByEventId,
    getVenusNameAndIsByEventLevel,
    updateVenueProctorMapping,
    getRegionsByEventId,
    getJudgesByEventRegion,
    insertRegionStaffMapping,
    insertCatStaffMapId,
    getQuestionTypesFromLookup,
    insertQuestionnaire,
    getSelCatsCGmapSection,
    deleteCategoryMapping,
    deleteGroupMapping,
    deleteCatGroupMapping,
    deleteVenues,
    getJudgeMapForAssSec,
    getDefinedQuestionnaire,
    deleteDefinedQuestions,
    updateQueStmtAndResType,
    deleteStaffRegionMapping,
    deleteStaffCatMapping,
    getSelectedAndAllEvaluators,
    insertEventEvaluator,
    deleteEvaluatorsForEvalSection
}