
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


module.exports= {
    updateEmailId,
    insUsrOpsLog,
    getAllregisteredEventsWithFamilyMemrs,
    getUpcomingEvents
}                                                