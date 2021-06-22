const getFamilyMembersFHid = `with family_tree as (select family_member_id user_id, relationship 
                                    from t_person_relationship tpr 
                                    where tpr.family_head_id = $1
                                    and is_deleted != true
                                    )
                                    select distinct vu.user_id,vu.baptismal_name, vu.email_id, vu.title,
                                    vu.first_name, vu.middle_name, vu.last_name,
                                    vu.dob, vu.mobile_no, family_tree.relationship from v_user vu, family_tree
                                    where vu.user_id = family_tree.user_id;`;
                                

module.exports = {
    getFamilyMembersFHid
}                                    