
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
                            from t_user_parish where membership_no = $1`;;




module.exports = {
    toMarkMembershipDelted,
    reInsertMembership,
    putRowInParisgTbl,
    insertOpLogTable,
    isUserAlreadyMember,
    markUserApproved,
    isMemberIdExists
}                                