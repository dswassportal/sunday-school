
const updateEmailId = `update t_user set email_id= $1 
                        where lower(email_id) = lower($2) returning user_id;`; 

const insUsrOpsLog =  `INSERT INTO t_user_operation_log
                            (user_id, operation_type, reason, performed_by, performed_date)
                            VALUES($1, $2, $3, $4, $5) returning user_id;`;                        


module.exports= {
    updateEmailId,
    insUsrOpsLog
}                                                