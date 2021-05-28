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

const  insertEventCords = `INSERT INTO t_event_coordinator (event_id, user_id, created_by, created_date) 
                          VALUES($1, $2, $3, $4) returning event_coordinator_id;`;

const  deleteEventCords = `DELETE FROM t_event_coordinator where event_id = $1;`  

// const insertCatMap = `INSERT INTO t_event_category_map(event_id, event_category_id)
//                             VALUES ($1, $2) returning event_cat_map_id;`

const insertCatMap = `INSERT INTO t_event_category_map (event_id, event_category_id)
                        select $1, $2
                        WHERE NOT EXISTS (
                        SELECT 1 FROM t_event_category_map turm 
                                            WHERE event_id = $1
                                            and event_category_id = $2
                                    ) returning event_cat_map_id;`

const getFrststEveTypIdByEveTyp =  `select event_type_id from t_event_category where lower(type) = lower($1) fetch first 1 row only;`;  

const insertNewCategory = `INSERT INTO t_event_category
                                    ("name", description, "type", event_type_id)
                           VALUES($1, $2, $3, $4) returning event_category_id;`;

// const  insertGradeGroupMapping =  `INSERT INTO t_event_grade_group_map
//                                 (event_id, grade_group_id, created_by, created_date)
//                                 VALUES($1, $2, $3, $4) returning event_grade_group_map_id;`;

const  insertGradeGroupMapping = `INSERT INTO t_event_grade_group_map(event_id, grade_group_id, created_by, created_date)
                                    select $1, $2, $3, $4
                                    WHERE NOT EXISTS (
                                    SELECT 1 FROM t_event_grade_group_map teggm 
                                                        WHERE teggm.event_id = $1
                                                        and teggm.grade_group_id = $2
                                                ) returning event_grade_group_map_id;`

const insertGradeGroup = `insert into t_grade_group (group_name, created_by, created_date) values ($1, $2, $3) returning grade_group_id;`;                           

const insertGradeGroupDtl = `insert into t_grade_group_detail ( grade_group_id, grade ) values ($1, $2);`;

const getSelecedAndAllCats = `select 
                            jsonb_agg(
                                jsonb_build_object(
                                    'catId', tec.event_category_id,
                                    'catName', tec."name", 
                                    'catDesc', tec.description,
                                    'catMapId', tecm.event_cat_map_id,
                                    'isSelected', case when tecm.event_cat_map_id is null then false else true end
                                ) 
                            ) event_cats
                            from t_event_category tec
                            left join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                            and tecm.event_id = $1
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
                                            'isSelected', case when teggm.event_grade_group_map_id is null then false else true end		  
                                        ) 
                                    ) selected_and_all_grades
                                    from t_grade_group tgg 
                                    left join t_event_grade_group_map teggm
                                    on tgg.grade_group_id = teggm.grade_group_id 
                                    and teggm.event_id = $1;`;    
                                    
const getEventGroupMapping = `select 
                                    jsonb_agg(
                                        jsonb_build_object(
                                            'gradeGroupName', tgg.group_name,
                                            'gradeGroupMapId', teggm.event_grade_group_map_id,
                                            'gradeGroupId', tgg.grade_group_id
                                            ) 
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
                                    ) 
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
                                                    ) returning event_cat_grade_grp_map_id;`; 
                                 

const getVenusAllDetailsByEventLevel =  `select jsonb_agg(
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
                                        'isSelected', case when tev.event_venue_id is null then false else true end
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
                                left join t_event_venue tev on  tu.user_id = tev.proctor_id  and event_id = 1259
                                left join t_venue tv on tv.venue_id = tev.venue_id 
                                join t_user_role_context turc on turc.user_id = tu.user_id and turc.org_id in (            
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
                                        'eventVenueMapId', tev.event_venue_id
                                        ) 
                                    ) venue_list from t_venue tv 
                                     join t_event_venue tev on tv.venue_id  = tev.venue_id and tev.event_id = $1
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


// const getJudgesByEventsRegion = `select distinct	
//                                     jsonb_agg(
//                                   distinct jsonb_build_object(
//                                         'judgeName', concat(tu.title,'. ', tu.first_name ,' ', tu.middle_name,' ', tu.last_name),
//                                         'judgeId', tu.user_id
//                                         ) 
//                                     ) judge_arr
//                                     from t_user tu
//                                     join t_user_role_context turc 
//                                     on turc.user_id = tu.user_id 
//                                     and turc.org_id in (            
//                                                             (WITH recursive child_orgs 
//                                                             AS (
//                                                                 SELECT org_id
//                                                                 FROM   t_organization parent_org 
//                                                                 WHERE  org_id in (select org_id from t_event_organization teo 
//                                                                                     where teo.event_id = $1)                                                  
//                                                                 UNION
//                                                                 SELECT     child_org.org_id child_id
//                                                                 FROM       t_organization child_org
//                                                                 INNER JOIN child_orgs c
//                                                                 ON         c.org_id = child_org.parent_org_id ) SELECT *
//                                                                     FROM   child_orgs))
//                                                 and turc.role_id in (select tr.role_id from t_role tr where lower(tr.name) like lower($2))
//                                         join t_user_role_mapping turm on turc.user_id = turm.user_id 
//                                         and coalesce(turm.role_start_date, current_date) <= current_date 
//                                         and coalesce(turm.role_end_date , current_date) >= current_date
//                                         and tu.is_deleted = false 
//                                         and tu.is_locked = false;`;

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
                                                    and teq.is_deleted = false) returning question_id;`                                    


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
    // getJudgesByEventsRegion
    getJudgesByEventRegion,
    insertRegionStaffMapping,
    insertCatStaffMapId,
    getQuestionTypesFromLookup,
    insertQuestionnaire 
}