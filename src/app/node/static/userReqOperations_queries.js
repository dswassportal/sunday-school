
const toMarkMembershipDelted = `UPDATE t_user_parish
                                SET membership_end_date= $1, is_deleted= true, updated_by= $2, updated_date= $3
                                WHERE user_id= $4 and is_deleted= false returning user_parish_id;`;


const reInsertMembership = `INSERT INTO t_user_parish
                            (user_id, org_id, membership_no, membership_type, membership_effective_date, updated_by, updated_date) 
                                (SELECT user_id, $1, membership_no, membership_type, $2 , $3, $4  FROM t_user_parish 
                                 WHERE user_parish_id= $5);`;


const putRowInParisgTbl = `INSERT INTO PUBLIC.t_user_parish
                                 (    user_id,
                                      org_id,
                                      membership_no,
                                      membership_type,
                                      membership_effective_date,
                                      created_by,
                                      created_date)
                                  VALUES ( $1, $2, $3, $4, $5, $6, $7);`;
                                  
const insertOpLogTable = `INSERT INTO public.t_user_operation_log
                            (user_id, operation_type, performed_by, performed_date) VALUES($1, $2, $3 ,$4);`;                                   

const isUserAlreadyMember = `select case when count(user_id) > 0 then true else false end  is_member
                                from t_user_parish tup 
                                where user_id = $1`;     
                                
const markUserApproved = `UPDATE t_user SET is_approved = true where user_id = $1;`            

const isMemberIdExists = `  select case when count(user_id) > 0 then true else false end is_mem_id_exists 
                            from t_user_parish where membership_no = $1`;



////////////////////////////////////////////// Set Staff Assignment \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const getSchoolRoleIds = `select 
                            tr."name" role_name , tr.role_id from t_role tr 
                            where name = 'Sunday School Teacher' 
                            or name = 'Sunday School Principal' 
                            or name = 'Sunday School Vice Principal';`;

const updateStaffRole =  `UPDATE t_user_role_mapping
                            SET role_id=$1, user_id=$2, role_start_date=$3, role_end_date=$4 
                            WHERE role_id=$1 and user_id=$2 and is_deleted = false returning user_role_map_id`; 
                            
const insertStaffRole = `INSERT INTO t_user_role_mapping (user_id, role_id, role_start_date, role_end_date)
                            select $1, $2, $3, $4  
                            WHERE NOT EXISTS (
                            SELECT 1 FROM t_user_role_mapping turm 
                                                WHERE user_id = $1 
                                                and role_id = $2
                                                and is_deleted = false
                                        ) returning user_role_map_id;`                            


let insertRoleContext = ` INSERT INTO t_user_role_context (user_id, role_id, org_id, created_by, created_date, user_role_map_id)
                                    select $1, $2, $3, $4, $5, $6  
                                    WHERE NOT EXISTS (
                                    SELECT 1 FROM t_user_role_context turm 
                                                        WHERE user_id = $1 
                                                        and role_id = $2
                                                        and org_id = $3
                                                        and is_deleted = false
                                                );`

let insertStaffAssignmt =` INSERT INTO t_organization_staff_assignment (org_id, user_id, role_id, role_type, is_primary, created_by, created_date, school_term_detail_id)
                                    select $1, $2, $3, $4, $5, $6, $7, $8
                                    WHERE NOT EXISTS (
                                    SELECT 1 FROM t_organization_staff_assignment tssa 
                                                        WHERE org_id = $1
                                                        and user_id = $2
                                                        and role_id = $3
                                                        and is_primary = $5
                                                        and school_term_detail_id = $8
                                                ) returning org_staff_assignment_id;`     

let updateStaffAssignment = `UPDATE t_organization_staff_assignment
                                SET org_id=$1, user_id=$2, updated_by=$3, updated_date=$4
                                WHERE school_term_detail_id=$5 and org_staff_assignment_id= $6 and is_primary= $7;`;
                                
let checkIsStaffAlreadyAssigned = `select org_staff_assignment_id 
                                        from t_organization_staff_assignment 
                                        where org_id=$1
                                        and user_id=$2
                                        and role_id=$3 
                                        and is_deleted=$4 
                                        and is_primary =$5
	                                    and school_term_detail_id=$6    `;                              
                                                                                    
const deleteStaffOrgMapping = `update t_organization_staff_assignment set is_deleted = true
                        WHERE org_id = $1 and role_id =$2 
                        and  is_primary= $3 
                        and school_term_detail_id= $4 
                        and org_staff_assignment_id not in ($5) 
                        returning org_staff_assignment_id;  `                                        


module.exports = {
    toMarkMembershipDelted,
    reInsertMembership,
    putRowInParisgTbl,
    insertOpLogTable,
    isUserAlreadyMember,
    markUserApproved,
    isMemberIdExists,
    //Set Staff Assignment
    getSchoolRoleIds,
    updateStaffRole,
    insertStaffRole,
    insertRoleContext,
    insertStaffAssignmt,
    updateStaffAssignment,
    checkIsStaffAlreadyAssigned,
    deleteStaffOrgMapping
}                                