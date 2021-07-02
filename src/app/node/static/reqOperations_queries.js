
const updateEmailId = `update t_user set email_id= $1 
                        where lower(email_id) = lower($2) returning user_id;`; 

const insUsrOpsLog =  `INSERT INTO t_user_operation_log
                            (user_id, operation_type, reason, performed_by, performed_date)
                            VALUES($1, $2, $3, $4, $5) returning user_id;`;       
                            
                            
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

const updateRelationship = `UPDATE t_person_relationship 
                            SET relationship= $1, is_deleted = $2, updated_by=$3 ,updated_date=$4 
                            where family_member_id= $5 and family_head_id= $6 returning relationship_id;`;

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
                        (org_id, email_id, firebase_id, title, first_name, middle_name, last_name, created_by, created_date, member_type, is_approved )
                        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning user_id;`;

const insertMemberIntoPersonTbl =  `INSERT INTO public.t_person
                                    (user_id, dob,  mobile_no, created_by, created_date, baptismal_name )
                                    VALUES($1 , $2, $3, $4, $5, $6);`;    
                                    
const assignMemberRoleToUsr = `insert into t_user_role_mapping (user_id, role_id)
                                select $1, role_id from t_role where name = 'Member' returning user_role_map_id;`;                                    
                                            
const insertPersonRelationship = `INSERT INTO t_person_relationship(
                                    family_head_id, family_member_id, relationship, created_by, created_date)
                                      VALUES ($1, $2, $3, $4, $5) returning relationship_id;`;         
                                      
 const deleteMemberRelationship = `UPDATE t_person_relationship
                                    SET  is_deleted=$1, updated_by=$2, updated_date=$3
                                    WHERE family_head_id= $4 and family_member_id not in ($5) returning relationship_id;`; 
                                    
const updateTUserForMember = `UPDATE t_user
                            SET title=$1, first_name=$2, middle_name=$3, last_name=$4, updated_by=$5, updated_date=$6
                            WHERE user_id= $7;`;            
                            
const updateTPersonForMember = `UPDATE t_person
                                SET  dob=$1, mobile_no=$2, baptismal_name=$3, updated_by=$4, updated_date=$5
                                WHERE user_id= $6;`;                            


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
    insertPersonRelationship,
    deleteMemberRelationship,
    updateTUserForMember,
    updateTPersonForMember
}                                                