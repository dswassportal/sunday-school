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

const insertCatMap = `INSERT INTO t_event_category_map(event_id, event_category_id)
                            VALUES ($1, $2) returning event_cat_map_id;`

const getFrststEveTypIdByEveTyp =  `select event_type_id from t_event_category where lower(type) = lower($1) fetch first 1 row only;`;  

const insertNewCategory = `INSERT INTO t_event_category
                                    ("name", description, "type", event_type_id)
                           VALUES($1, $2, $3, $4) returning event_category_id;`;

const  insertGradeGroupMapping =  `INSERT INTO t_event_grade_group_map
                                (event_id, grade_group_id, created_by, created_date)
                                VALUES($1, $2, $3, $4) returning event_grade_group_map_id;`;

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
                                            'eventGradeGroupMapId', teggm.event_grade_group_map_id,
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
                                    'eventCatMapId', tecm.event_cat_map_id,
                                    'catId', tec.event_category_id 
                                    ) 
                                ) cat_mapping
                                from t_event_category tec 
                                join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                                and tecm.event_id = $1;`;                                    


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
    getEventCatMapping
}