const getFamilyMembersFHid = `with family_tree as (select family_member_id user_id, relationship 
                                    from t_person_relationship tpr 
                                    where tpr.family_head_id = $1
                                    and is_deleted != true
                                    )
                                    select distinct vu.user_id,vu.baptismal_name, vu.email_id, vu.title,
                                    vu.first_name, vu.middle_name, vu.last_name,
                                    vu.dob, vu.mobile_no, family_tree.relationship from v_user vu, family_tree
                                    where vu.user_id = family_tree.user_id;`;
                                

const getRegionOfuser = `with recursive child_orgs as (
                                select org_id org_id, org_type, name org_name, parent_org_id parent_id from t_organization parent_org
                                where org_id in (select org_id from t_user where user_id = $1)
                            union
                            select child_org.org_id child_id, child_org.org_type, child_org.name child_name, child_org.parent_org_id pid
                            from t_organization child_org
                            inner join child_orgs c on c.parent_id = child_org.org_id
                            ) select org_id from child_orgs where org_type = 'Region';`;

module.exports = {
    getFamilyMembersFHid,
    getRegionOfuser
}                                    