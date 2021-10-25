
const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);
const queries = require(`${__dirname}/static/reqScoreOperations_queries.js`);



async function getParticipant(eventId, userId, action, judgeId, catId) {
    console.log('fetching participants for event ' + eventId + ', user : ' + userId);

    let client = await dbConnections.getConnection();
    try {
        let getPaticipantQuery;
        if (action == 'upload') {


            let getEventType = `select event_type from t_event te where event_id = $1`;
            let EveTypeResult = await client.query(getEventType, [eventId]);
            if (EveTypeResult.rowCount > 0) {

                if (EveTypeResult.rows[0].event_type === 'Sunday School Final Exam' || EveTypeResult.rows[0].event_type === 'Sunday School Midterm Exam') {
                    console.log("userId", userId);
                    getPaticipantQuery = `select distinct  
                                                    jsonb_agg(
                                                        distinct jsonb_build_object(
                                                                'regId', tepr.event_participant_registration_id,
                                                                'enrollmentId',  tepr.enrollment_id,
                                                                'score',tpes.score,
                                                                'scoreRefId' , tpes.participant_event_score_id,
                                                                'isScoreSubmitted', tecsm.is_score_submitted,
                                                                'category', tec."name" 
                                                        ) ) participants
                                                from t_event_cat_staff_map tecsm
                                                join  t_event_participant_registration tepr on tecsm.event_id = tepr.event_id 
                                                    and tepr.event_id = ${eventId}  and tecsm.user_id = ${userId} and tecsm.is_deleted = false 
                                                    and tepr.registration_status = 'Registered' and tepr.has_attended = true
                                                    join t_event_category_map tecm on tecm.event_id = tepr.event_id 
                                                    left join t_participant_event_score tpes on tpes.event_participant_registration_id = tepr.event_participant_registration_id 
                                                         and tpes.is_deleted = false and tecsm.user_id = ${userId}   
                                                    join t_event_category tec on tec.event_category_id = tecm.event_category_id 
                                                    join t_organization to2 on to2.org_id = tecsm.role_id
                                                    join t_student_sundayschool_dtl tssd on tssd.school_grade = to2."name"
                                                    and tepr.user_id = tssd.student_id;`
                } else {
                    getPaticipantQuery = ` select jsonb_agg(
                                                jsonb_build_object(
                                                'regId', tepr.event_participant_registration_id,
                                                'enrollmentId',  tepr.enrollment_id,
                                                'category', tec."name",
                                                'score',tpes.score,
                                                'eventCatId', tecm.event_category_id,
                                                'catStaffMapId',tecsm2.event_cat_staff_map_id,
                                                'scoreRefId' , tpes.participant_event_score_id,
                                                'partEveRegCatId', tperc.participant_event_reg_cat_id,
                                                'isScoreSubmitted', tecsm2.is_score_submitted              
                                                )
                                            ) participants			
                                            from t_event_participant_registration tepr
                                            join t_user tu on tepr.user_id = tu.user_id 
                                            and tepr.event_id = ${eventId} 
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
                                                                            and tecsm.event_id = ${eventId} and tecsm.user_id = ${userId})                                                    
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
                                            and tecsm2.user_id = ${userId} and tecsm2.is_deleted != true
                                            left join t_participant_event_score tpes on tpes.event_cat_staff_map_id = tecsm2.event_cat_staff_map_id 
                                            and tpes.participant_event_reg_cat_id = tperc.participant_event_reg_cat_id;`;
                }
            }
        } else if (action == 'approve') {

            getPaticipantQuery = `select jsonb_agg(
                                                    jsonb_build_object(
                                                    'enrollmentId',  res.enrollment_id,
                                                    'category', res.event_category_name,
                                                    'score', res.score,
                                                    'categoryId', res.event_category_id,
                                                    'isScoreApproved', res.is_score_approved,
                                                    'judgeId', res.staff_id,
                                                    'judgeName', res.judge_name,
                                                    'catStaffMapId', res.event_cat_staff_map_id,
                                                    'catMapId', res.event_cat_map_id,
                                                    'partFullName', res.participant_name,
                                                    'parish', res.parish,
                                                    'scoreRefId', res.participant_event_score_id,
                                                    'partEveRegCatId', res.participant_event_reg_cat_id
                                                     ) 
                                                ) participants                                  
                                    from (  select distinct staff_id, participant_event_reg_cat_id, event_cat_map_id, enrollment_id, score, event_category_id, event_category_name,
                                        concat(staff_first_name, ' ', staff_last_name ) judge_name,
                                         is_score_approved, event_cat_staff_map_id, torg."name" parish,
                                        concat(tu.title ,'. ', tu.first_name, ' ', tu.middle_name, ' ', tu.last_name) participant_name, 
                                        participant_event_score_id
                                    from v_event_participant vep 
                                    inner join t_user tu on vep.participant_id = tu.user_id 
                                    inner join t_organization torg on tu.org_id = torg.org_id 
                                    where event_id = ${eventId} 
                                    and staff_id = ${judgeId}
                                    and event_category_id = ${catId}
                                    and has_attended = true
                                    and is_score_submitted = true order by enrollment_id, event_category_name asc) res;`;

        } else if (action === 'attendance') {

            getPaticipantQuery = ` select jsonb_agg(
                                    distinct
                                        jsonb_build_object(
                                            'enrollmentId', tepr.enrollment_id,
                                            'isAttendanceSubmitted', tev.is_attendance_submitted,
                                            'hasAttended',  tepr.has_attended ,
                                            --'grade', tepr.school_grade,
                                            'group', tgg.group_name,
                                            'role', tepr."role", 
                                            'participantId', tepr.user_id ,
                                            'eventPartRegId', tepr.event_participant_registration_id,
                                            'participantName', concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ', tu.last_name),
                                            'participantParish', to2."name"
                                        ) 
                                    ) participants 
                                from t_event_participant_registration tepr
                                join t_user tu on tu.user_id = tepr.user_id 
                                        and tu.is_deleted = false 
                                        and tepr.registration_status != 'Canceled'
                                        and tepr.event_id = ${eventId}
                                join t_student_sundayschool_dtl tssd1 on tssd1.student_id = tu.user_id      
                                join t_grade_group_detail tggd on tggd.grade = tssd1.school_grade 
                                join t_grade_group tgg on tggd.grade_group_id = tgg.grade_group_id
                                join t_student_sundayschool_dtl tssd on tssd.school_grade = tggd.grade                          
                                join t_organization to2 on to2.org_id = tu.org_id 
                                join t_event_venue tev on  tepr.event_venue_id = tev.event_venue_id 
                                and tev.proctor_id = ${userId}
                                and tev.event_id = ${eventId}
                                and tev.is_deleted = false;`
                                console.log("userId", userId);

        } else {
            console.log('Invalid action sent to getParticipant api, action recived to process  : ' + action);
            return (errorHandling.handleDBError('connectionError'));
        }
        let result = await client.query(getPaticipantQuery);
        return {
            data: {
                status: 'success',
                paticipants: result.rowCount > 0 ? result.rows[0].participants : []
            }
        }

    } catch (error) {
        console.error(`eventReqOperations.js::getParticipant() : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }

}

async function getEventCatsAndStaffById(eventId, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        let queryStmt = ` select         
                                jsonb_agg(
                                        distinct jsonb_build_object('categoryId', vep.event_cat_map_id,
                                                                    'categoryName', vep.event_category_name  ) 		
                                            ) catarr,
                                jsonb_agg(
                                        distinct jsonb_build_object('judgeId', vep.staff_id,
                                                                    'judgeName', concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ', tu.last_name) ) 		
                                            ) judgearr 		                                    
                                from v_event_participant vep 
                                join t_user tu on vep.staff_id = tu.user_id 
                                and vep.event_id = ${eventId}
                                and tu.org_id in (WITH recursive child_orgs 
                                                AS (
                                                    SELECT org_id
                                                    FROM   t_organization parent_org 
                                                    WHERE  org_id in 
                                                                             (select turc.org_id from t_user tu join t_user_role_context turc 
                                						 									on tu.user_id = turc.user_id and turc.user_id = ${loggedInUser}) 
                                                    UNION
                                                    SELECT     child_org.org_id child_id
                                                    FROM       t_organization child_org
                                                    INNER JOIN child_orgs c
                                                    ON         c.org_id = child_org.parent_org_id ) SELECT *
                                    FROM   child_orgs);`;

        let result = await client.query(queryStmt);

        return {
            data: {
                status: 'success',
                eventData: result.rows[0]
            }
        }

    } catch (error) {
        console.error(`eventReqOperations.js::getEventCatsAndStaffById() : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }

}

module.exports = {
    getParticipant,
    getEventCatsAndStaffById
}