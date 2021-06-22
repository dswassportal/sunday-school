
const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);



async function getParticipant(eventId, userId, action, judgeId, catId) {
    console.log('fetching participants for event ' + eventId + ', user : ' + userId);

    let client = await dbConnections.getConnection();
    try {
        let getPaticipantQuery;
        if (action == 'upload') {
            getPaticipantQuery = ` select jsonb_agg(
                                                    jsonb_build_object(
                                                    'regId', res.event_participant_registration_id,
                                                    'enrollmentId',  res.enrollment_id,
                                                    'category', res.event_category_name,
                                                    'score', res.score,
                                                    'categoryId', res.event_category_id,
                                                    'catStaffMapId',res.event_cat_staff_map_id,
                                                    'scoreRefId' , res.participant_event_score_id,
                                                    'partEveRegCatId', res.participant_event_reg_cat_id,
                                                    'isScoreSubmitted', res.is_score_submitted              
                                                    ) 
                                            ) participants from (
                                                select distinct event_participant_registration_id,
                                                event_category_id, score, event_cat_staff_map_id, participant_event_reg_cat_id,
                                                event_category_name, enrollment_id, participant_event_score_id, 
                                                is_score_submitted, is_attendance_submitted 
                                                from v_event_participant vep
                                                where event_id = ${eventId}
                                                and is_attendance_submitted = true
                                                and has_attended = true
                                                and staff_id = ${userId} order by event_category_id, enrollment_id asc) res;`;
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
                                                    jsonb_build_object(
                                                        'enrollmentId', res.enrollment_id,
                                                        'eventCategoryId', res.event_category_id,
                                                        'eventCategoryName', res.event_category_name,
                                                        'hasAttended', res.has_attended,
                                                        'participantId', res.participant_id,
                                                        'eventPartRegId', res.event_participant_registration_id,
                                                        'isAttendanceSubmitted', res.is_attendance_submitted
                                                    ) 
                                                ) participants
                                                from (select distinct is_attendance_submitted, event_participant_registration_id, participant_id, enrollment_id, event_category_name, event_category_id,has_attended 
                                                        from v_event_participant vep 
                                                        where event_id = ${eventId}
                                                        and event_category_id = ${catId}
                                                        order by enrollment_id asc
                                                        ) res;`

        } else {
            console.log('Invalid action sent to getParticipant api, action recived to process  : ' + action);
            return (errorHandling.handleDBError('connectionError'));
        }
        let result = await client.query(getPaticipantQuery);
        return {
            data: {
                status: 'success',
                paticipants: result.rows[0] == undefined ? [] : result.rows[0].participants
            }
        }

    } catch (error) {
        console.error(`eventReqOperations.js::getParticipant() : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }

}

async function getEventCatsAndStaffById(eventId) {

    let client = await dbConnections.getConnection();
    try {
        let queryStmt = `select         
                                jsonb_agg(
                                        distinct jsonb_build_object('categoryId', res.event_category_id,
                                                                    'categoryName', res.event_category_name ) 		
                                            ) catarr,
                                jsonb_agg(
                                        distinct jsonb_build_object('judgeId', res.staff_id,
                                                                    'judgeName', res.judge_name ) 		
                                            ) judgearr 		                                    
                        from  
                            ( select distinct staff_id, concat(staff_first_name, ' ', staff_last_name ) judge_name,
                                event_category_id, event_category_name from v_event_participant 
                                where event_id = ${eventId}) res;`;

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