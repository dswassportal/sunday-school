
const updateEmailId = `update t_user set email_id= $1 
                        where lower(email_id) = lower($2) returning user_id;`; 

const insUsrOpsLog =  `INSERT INTO t_user_operation_log
                            (user_id, operation_type, reason, performed_by, performed_date)
                            VALUES($1, $2, $3, $4, $5) returning user_id;`;   

const getAllRegisteredEventsAndScore = `select distinct  te.event_id, tpeos.overall_score, tec."name" as category, tpeos.event_category_map_id ,te."name", te.event_type, 
te.start_date, te.end_date, 
te.registration_start_date, te.registration_end_date,
tepr.enrollment_id, tepr.registration_status, 
tu.user_id participant_id,
concat(tu.title,'. ', tu.first_name,' ',tu.middle_name, ' ', tu.last_name) participant_name,
concat(tu2.title,'. ', tu2.first_name,' ',tu2.middle_name, ' ', tu2.last_name) registered_by,
tepr.created_date registered_on
from t_event te join t_event_organization teo on te.event_id = teo.event_id                
and teo.org_id in ( with recursive child_orgs as (
                    select org_id org_id, parent_org_id parent_id from t_organization parent_org
                     where org_id in (select org_id from t_user where user_id = $1 )
                          union
                      select child_org.org_id child_id, child_org.parent_org_id pid
                         from t_organization child_org
                        inner join child_orgs c on c.parent_id = child_org.org_id
               ) select org_id from child_orgs)
and te.is_deleted != true
join t_event_participant_registration tepr on te.event_id = tepr.event_id 
and tepr.is_deleted != true 
and tepr.user_id in (select family_member_id from t_person_relationship tpr 
where tpr.family_head_id = $1 union select $1 ) 
left join t_participant_event_overall_score tpeos on tpeos.event_participant_registration_id = tepr.event_participant_registration_id
and tepr.event_id = te.event_id 
left join t_event_category_map tecm on tpeos.event_category_map_id = tecm.event_cat_map_id 
left join t_event_category tec on tec.event_category_id = tecm.event_category_id 
join t_user tu on tepr.user_id = tu.user_id and tu.is_deleted != true
join t_user tu2 on tepr.created_by = tu2.user_id;`;                            
                            
const getAllregisteredEventsWithFamilyMemrs = `select distinct  te.event_id, te."name", te.event_type, 
                                                     te.start_date, te.end_date, 
                                                    te.registration_start_date, te.registration_end_date,
                                                    tepr.enrollment_id, tepr.registration_status, 
                                                    tu.user_id participant_id,
                                                    concat(tu.title,'. ', tu.first_name,' ',tu.middle_name, ' ', tu.last_name) participant_name,
                                                    concat(tu2.title,'. ', tu2.first_name,' ',tu2.middle_name, ' ', tu2.last_name) registered_by,
                                                    tepr.created_date registered_on
                                                from t_event te join t_event_organization teo on te.event_id = teo.event_id                
                                                and teo.org_id in ( with recursive child_orgs as (
                                                                         select org_id org_id, parent_org_id parent_id from t_organization parent_org
                                                                          where org_id in (select org_id from t_user where user_id = $1 )
                                                                               union
                                                                           select child_org.org_id child_id, child_org.parent_org_id pid
                                                                              from t_organization child_org
                                                                             inner join child_orgs c on c.parent_id = child_org.org_id
                                                                    ) select org_id from child_orgs)
                                                and te.is_deleted != true
                                                join t_event_participant_registration tepr on te.event_id = tepr.event_id 
                                                and tepr.is_deleted != true 
                                                and tepr.user_id in (select family_member_id from t_person_relationship tpr 
                                                    where tpr.family_head_id = $1 union select $1 ) 
                                                join	t_user tu on tepr.user_id = tu.user_id and tu.is_deleted != true
                                                join	t_user tu2 on tepr.created_by = tu2.user_id ; `;
                                                
const getUpcomingEvents = `select distinct te.event_id, te."name", te.event_type, 
                           te.start_date, te.end_date, 
                            te.registration_start_date, te.registration_end_date
                            from t_event te join t_event_organization teo on te.event_id = teo.event_id                
                            and teo.org_id in ( with recursive child_orgs as (
                                    select org_id org_id, parent_org_id parent_id from t_organization parent_org
                                    where org_id in (select org_id from t_user where user_id = $1 )
                                    union
                                    select child_org.org_id child_id, child_org.parent_org_id pid
                                    from t_organization child_org
                                    inner join child_orgs c on c.parent_id = child_org.org_id
                                    ) select org_id from child_orgs)
                            and te.registration_end_date >= current_date  and te.is_deleted != true;`;                                                

const updateRelationship = `UPDATE t_person_family 
                            SET relationship= $1, is_deleted = $2, updated_by=$3 ,updated_date=$4 
                            where family_member_id= $5 and family_id= $6;`;

const toCheckIsMemberExistsWithSameName = `select 
                                            case when count(tu.user_id) > 0 then true else false end is_member_exists 
                                            from t_user tu 
                                            join t_person_relationship tpr on tu.user_id = tpr.family_member_id 
                                            where tpr.family_head_id = $1 
                                                and lower(email_id) = lower($2)
                                                and lower(first_name) = lower($3)
                                                and lower(last_name) = lower($4)
                                                and lower(title) = lower($5)
                                                and lower(tpr.relationship) = lower($6)
                                                and tu.is_deleted != true
                                                and tpr.is_deleted != true;`;              
                                                                                        
const insertMemberIntoUserTbl = `INSERT INTO public.t_user
                        (org_id, email_id, firebase_id, title, first_name, middle_name, last_name, created_by, created_date, member_type, is_approved, user_name )
                        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning user_id;`;

const insertMemberIntoPersonTbl =  `INSERT INTO public.t_person
                                    (user_id, dob,  mobile_no, created_by, created_date, baptismal_name, family_id)
                                    VALUES($1 , $2, $3, $4, $5, $6, $7);`;    
                                    
const assignMemberRoleToUsr = `insert into t_user_role_mapping (user_id, role_id)
                                select $1, role_id from t_role where name = 'Member' returning user_role_map_id;`;                                    
                                            
// const insertPersonRelationship = `INSERT INTO t_person_relationship(
//                                     family_head_id, family_member_id, relationship, created_by, created_date)
//                                       VALUES ($1, $2, $3, $4, $5) returning relationship_id;`;         
                                      
 const deleteMemberRelationship = `UPDATE t_person_family
                                    SET  is_deleted=$1, updated_by=$2, updated_date=$3
                                    WHERE family_id= $4 and family_member_id not in ($5) ;`; 
                                    
const updateTUserForMember = `UPDATE t_user
                            SET title=$1, first_name=$2, middle_name=$3, last_name=$4, updated_by=$5, updated_date=$6
                            WHERE user_id= $7;`;            
                            
const updateTPersonForMember = `UPDATE t_person
                                SET  dob=$1, mobile_no=$2, baptismal_name=$3, updated_by=$4, updated_date=$5
                                WHERE user_id= $6;`;        
                                
const insertPersonPrelationshipTbl = ` INSERT INTO t_person_family
                                    (family_id, family_member_id, relationship, is_deleted, created_by, created_date)
                                    VALUES($1, $2, $3, $4, $5, $6);`                                

const updateFamId = `UPDATE t_person SET family_id=$1 WHERE user_id=$2`;

const updateIsFamHead = `update t_user set is_family_head = $1 where user_id =$2`; 

const checkNewMemEmailAndRelationExists = `select 
                                            user_id, 
                                            case when count(user_id) > 0 then true else false end user_exists, 
                                            case when count(tpf.family_member_id) > 0 then true else false end user_family_related 
                                            from t_user tu
                                            left join t_person_family tpf on tu.user_id = tpf.family_member_id 
                                            and tpf.is_deleted = false
                                            and tu.is_deleted = false 
                                            where lower(tu.email_id) = lower($1) 
                                            and lower(tu.first_name) = lower($2)
                                            and lower(tu.last_name) = lower($3)
                                            group by user_id;`;

const insertFamilyHeadRole = `insert into t_user_role_mapping (user_id, role_id)
                             (select $1, role_id from t_role where name = 'Family Head');`;                                            

const deleteFamilyHeadRole = `delete from t_user_role_mapping 
                            where user_id = $1 and role_id = (select role_id from t_role where name = 'Family Head');`;    
                           
const insertFamilyHeadRel = `INSERT INTO t_person_family (family_id, family_member_id, relationship, created_by, created_date)
                             select $1, $2, $3, $2, $4
                            WHERE NOT EXISTS (
                            SELECT 1 FROM t_person_family tpf 
                                                WHERE family_member_id = $2 
                                                and is_deleted = false
                                        );`;                             

const deleteFamIdRelTPerson = `update t_person set family_id =  nextval('s_family') where user_id not in ($2) and family_id  = $1;`;           

const getEventForAttendance = ` select 
                                    jsonb_agg(
                                   distinct jsonb_build_object(
                                        'eventId', te.event_id, 
                                        'eventType' , te.event_type,
                                        'startDate', to_char(te.start_date , 'DD-MM-YYYY'),
                                        'endDate', to_char(te.end_date, 'DD-MM-YYYY'),
                                        'name', te."name"
                                        ) 
                                    ) events  from  t_event_venue tev
                                        join t_event te on tev.event_id = te.event_id 
                                        left join t_event_category_map tecm on tecm.event_id = te.event_id
                                        left join t_event_category tec on tecm.event_category_id = tec.event_category_id 
                                        where proctor_id = $1;`;

module.exports= {
    updateEmailId,
    insUsrOpsLog,
    getAllregisteredEventsWithFamilyMemrs,
    getUpcomingEvents,
    updateRelationship,
    toCheckIsMemberExistsWithSameName,
    insertMemberIntoUserTbl,
    insertMemberIntoPersonTbl,
    assignMemberRoleToUsr,
    // insertPersonRelationship,
    deleteMemberRelationship,
    updateTUserForMember,
    updateTPersonForMember,
    insertPersonPrelationshipTbl,
    updateFamId,
    updateIsFamHead,
    checkNewMemEmailAndRelationExists,
    insertFamilyHeadRole,
    deleteFamilyHeadRole,
    insertFamilyHeadRel,
    deleteFamIdRelTPerson,
    getEventForAttendance,
    getAllRegisteredEventsAndScore
}                                                