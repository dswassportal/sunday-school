const getScoreByJudgeId = ` select jsonb_agg(
                                    jsonb_build_object(
                                    'regId', tepr.event_participant_registration_id,
                                    'enrollmentId',  tepr.enrollment_id,
                                    'categoryName', tec."name",
                                    'score',tpes.score,
                                    'eventCatId', tecm.event_category_id,
                                    'catStaffMapId',tecsm2.event_cat_staff_map_id,
                                    'scoreRefId' , tpes.participant_event_score_id,
                                    'partEveRegCatId', tperc.participant_event_reg_cat_id,
                                    'isScoreSubmitted', tecsm2.is_score_submitted              
                                    )
                                ) 			
                                from t_event_participant_registration tepr
                                join t_user tu on tepr.user_id = tu.user_id 
                                and tepr.event_id = $1 
                                and tepr.registration_status != 'Canceled'
                                and tepr.is_deleted = false
                                and tepr.has_attended = true
                                and tu.org_id in
                                (WITH recursive child_orgs 
                                            AS (
                                                SELECT org_id
                                                FROM   t_organization parent_org 
                                                WHERE  org_id IN
                                                        ( select tersm.org_id 
                                                                from t_event_cat_staff_map tecsm 
                                                                join t_event_region_staff_map tersm on tersm.event_region_staff_map_id = tecsm.event_region_staff_map_id 
                                                                and tecsm.event_id = 1470 and tecsm.user_id = $2)                                                    
                                                UNION
                                                SELECT     child_org.org_id child_id
                                                FROM       t_organization child_org
                                                INNER JOIN child_orgs c
                                                ON         c.org_id = child_org.parent_org_id ) SELECT *
                                FROM   child_orgs)
                                join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id 
                                join t_event_category_map tecm on tecm.event_cat_map_id = tperc.event_category_id
                                join t_event_category tec on tec.event_category_id = tecm.event_category_id 
                                join t_event_cat_staff_map tecsm2 on tecsm2.event_category_map_id =  tecm.event_cat_map_id
                                and tecsm2.user_id = $2
                                left join t_participant_event_score tpes on tpes.event_cat_staff_map_id = tecsm2.event_cat_staff_map_id 
                                and tpes.participant_event_reg_cat_id = tperc.participant_event_reg_cat_id;`;

module.exports = {
    getScoreByJudgeId
}                                