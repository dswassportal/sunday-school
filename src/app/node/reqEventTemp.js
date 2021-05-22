const { Client, Pool } = require('pg');
const _ = require('underscore');
const firebase = require('firebase');
const firebaseConfig = require('./firebase/firebaseAdminUtils');
const errorHandling = require('./ErrorHandling/commonDBError');
const { result } = require('underscore');
const { json } = require('express');

const dbConnections = require(`${__dirname}/dbConnection`);


async function getEventById(eventId, isParticipant, userId) {

    console.log('getEventById called, Fetching event data for : ' + eventId);


    let event = {};
    //  return new Promise((resolve, reject) => {

    // try {
    let client = await dbConnections.getConnection();
    //client.query("BEGIN");
    try {
        let venues = [];
        let categories = [];
        let questionnaire = [];
        let orgIds = [];
        let eventCategoryId = 0;
        let eventVenueId = 0;

        // console.log("1");
        /********************** v_event*******************************************************************************************/
        const eventQuery = `select distinct event_id, event_type, event_name, event_desciption, registration_start_date, registration_end_date, event_start_date,
                                    event_end_date, event_url, org_type, org_id, org_name, 
                                    event_venue_id, venue_id, event_venue_name, proctor_id, event_cat_map_id,
                                    event_category_id, category_name, category_type, school_grade_from, school_grade_to,
                                    event_category_id, event_cat_staff_map_id, judge_id,
                                    question_id, question, answer_type, coordinator_id, exam_start_date, exam_end_date
                                    from v_event  where is_deleted = false and event_id = ${eventId}
                                    order by event_category_id,venue_id;`

        let result = await client.query(eventQuery);

        //console.log("2");

        if (result && result.rowCount > 0) {
            //console.log("Event name == ", result.rows[0].event_name)
            event.eventId = result.rows[0].event_id;
            event.name = result.rows[0].event_name;
            event.description = result.rows[0].event_desciption;
            event.eventType = result.rows[0].event_type;
            event.registrationStartDate = result.rows[0].registration_start_date;
            event.registrationEndDate = result.rows[0].registration_end_date;
            event.startDate = result.rows[0].event_start_date;
            event.endDate = result.rows[0].event_end_date;
            event.orgType = result.rows[0].org_type;
            event.eventUrl = result.rows[0].event_url;
            event.ttcExamStartDate = result.rows[0].exam_start_date;
            event.ttcExamEndDate = result.rows[0].exam_end_date;

            let category = {};
            let venue = {};
            let judges = [];
            let venueId = [];
            let question = {};
            let eventCoordinator = [];   

            for (let row of result.rows) {

                // Get list of org ids
                if (row.org_id != null) {
                    if (orgIds.indexOf(row.org_id) < 0)
                        orgIds.push(row.org_id)
                }

                if (row.coordinator_id != null) {
                    if (eventCoordinator.indexOf(row.coordinator_id) < 0)
                        eventCoordinator.push(row.coordinator_id)
                }                //Get list of venues
                if (row.venue_id != null) {

                    if (eventVenueId == 0) {
                        eventVenueId = row.event_venue_id;
                    } else if (row.event_venue_id != eventVenueId) {

                        if (_.findWhere(venues, venue) == null) {
                            venues.push(venue);
                        }
                        venue = {};
                    }

                    venue.venueId = row.venue_id;
                    venue.eventVenueId = row.event_venue_id;
                    venue.event_venue_id = row.event_venue_id;
                    venue.proctorId = row.proctor_id;
                }
                // Get categories
                if (eventCategoryId == 0) {
                    eventCategoryId = row.event_category_id;
                    //console.log("6 " , eventCategoryId);                    

                } else if (row.event_category_id != eventCategoryId) {
                    eventCategoryId = row.event_category_id;

                    // Add Venue and judges to category and add categry to categories array
                    category.venueId = venueId;
                    category.judges = judges;

                    if (_.findWhere(categories, category) == null) {
                        categories.push(category);
                    }

                    category = {};
                    venueId = [];
                    judges = [];
                }

                category.eventCategoryID = eventCategoryId;
                category.eventCatMapId = row.event_cat_map_id;
                category.name = row.category_name;
                category.schoolGradeFrom = row.school_grade_from;
                category.schoolGradeTo = row.school_grade_to;

                if (row.venue_id != null) {
                    // console.log("6.2", row.venue_id);
                    if (venueId.indexOf(row.venue_id) < 0)
                        venueId.push(row.venue_id)
                }
                if (row.judge_id != null) {
                    if (judges.indexOf(row.judge_id) < 0)
                        judges.push(row.judge_id)
                }

                //Get list of questions
                if (row.question_id != null) {
                    question = {};
                    question.questionId = row.question_id;
                    question.question = row.question;
                    question.responseType = row.answer_type;
                    if (_.findWhere(questionnaire, question) == null) {
                        questionnaire.push(question);
                    }
                }

            } // End of for loop

            // Processing for the last row
            if (_.findWhere(venues, venue) == null) {
                venues.push(venue);
            }

            if (_.findWhere(questionnaire, question) == null) {
                questionnaire.push(question);
            }

            category.venueId = venueId;
            category.judges = judges;

            if (_.findWhere(categories, category) == null) {
                categories.push(category);
            }

            event.orgId = orgIds;
            event.venues = venues;
            event.categories = categories;
            event.questionnaire = questionnaire;
            event.eventCoordinator = eventCoordinator;
            console.log(`Stringified JSON is : ` + JSON.stringify(event))
        }

        if (isParticipant === 'true') {
            let query = ` select enrollment_id from t_event_participant_registration 
                            where user_id = ${userId} and event_id = ${eventId};`

            let result = await client.query(query);
            event.enrollmentId = result.rows[0].enrollment_id
        }

        return ({
            data: {
                status: 'success',
                eventData: event
            }
        })

        //console.log(`Stringified JSON is : ` + JSON.stringify(event))

        // console.log(JSON.stringify(event));

    } catch (err) {
        // client.query("ROLLBACK");
        console.error(`reqOperations.js::insertevents() inner try block --> error : ${err}`)
        console.log("Transaction ROLLBACK called");
        return (errorHandling.handleDBError('transactionError'));
    } finally {
        client.release(false);
    }
    // }
    // catch (error) {
    //     console.error(`reqOperations.js::insertevents() --> outer try block : ${error}`);
    //     return (errorHandling.handleDBError('connectionError'));
    // } finally {
    //     // console.log('Finally block executed.. Connection closed.')
    //      client.release(false);
    // }
    // });
}


async function eventRegistration(eventData, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        await client.query('begin;');

        // Populating t_event_participant_registration table.

        let eventType = await client.query(`select event_type from t_event te where event_id = ${eventData.eventId};`)
        eventType = eventType.rows[0].event_type;
        console.log(`Event type for ${eventData.eventId} is ${eventType}`);

        //query to insert into t_event_participant_registration table
        const registerQuery = `INSERT INTO t_event_participant_registration
        (event_id, user_id, school_grade, is_deleted, created_by, created_date, enrollment_id)
        VALUES($1, $2, $3, $4, $5, $6, $7) returning event_participant_registration_id;`

            if (eventType === 'CWC') {
                console.log('Participant id is :: ' + loggedInUser);
                let enrollmentId;
                for (; ;) {
                    let randomNo = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
                    let isRandomNoExists = `select case when count(enrollment_id) = 0 then false
                                    else true end ran_no from t_event_participant_registration 
                                    where enrollment_id ='${randomNo}';`;

                    let ranNoResult = await client.query(isRandomNoExists);
                    if (ranNoResult.rows[0].ran_no == false) {
                        enrollmentId = randomNo;
                        break;
                    }
                }
                
                let registerQueryValues = [
                eventData.eventId,
                loggedInUser,
                eventData.schoolGrade,
                false,
                loggedInUser,
                new Date().toUTCString(),
                enrollmentId
            ];

            let result = await client.query(registerQuery, registerQueryValues)
            let participantRegId = result.rows[0].event_participant_registration_id;
            console.log('inserted into t_event_participant_registration!, for event_participant_registration_id : ' + participantRegId +
                ' and with enrollment Id: ' + enrollmentId + ' by ' + loggedInUser);
                
            // Populating t_participant_event_reg_cat table.
            const registerEvtCatQuery = `INSERT INTO t_participant_event_reg_cat
        (event_participant_registration_id, event_category_id, user_id, is_deleted, created_by, created_date)
        VALUES($1, $2, $3, $4, $5, $6);`

            for (const catId of eventData.categories) {

                let registerEvtCatQueryValues = [
                    participantRegId,
                    catId,
                    loggedInUser,
                    false,
                    loggedInUser,
                    new Date().toUTCString()
                ];
                await client.query(registerEvtCatQuery, registerEvtCatQueryValues)
                console.log('inserted into t_participant_event_reg_cat!, for category : ' + catId + ' and registration_id is : ' + participantRegId);
            }

            // Populating t_event_question_response table.
            const insertQueRespQry = `INSERT INTO t_event_question_response
                                (event_participant_registration_id, question_id, answer, created_by, created_date)
                                VALUES($1, $2, $3, $4, $5 );`;

            for (const question of eventData.questionnaire) {

                let insertQueRespValues = [
                    participantRegId,
                    question.questionId,
                    question.answer,
                    eventData.participantId,
                    new Date().toUTCString()
                ];
                await client.query(insertQueRespQry, insertQueRespValues)
                console.log('inserted into t_event_question_response!, for question : ' + question.questionId + ' and registration_id is : ' + participantRegId);
            }
            await client.query('commit;')
        } else if (eventType === 'TTC') {
            console.log("999");
            for (let ttcParticipant of eventData.participants) {

                let enrollmentId;
                for (; ;) {
                    let randomNo = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
                    let isRandomNoExists = `select case when count(enrollment_id) = 0 then false
                                    else true end ran_no from t_event_participant_registration 
                                    where enrollment_id ='${randomNo}';`;

                    let ranNoResult = await client.query(isRandomNoExists);
                    if (ranNoResult.rows[0].ran_no == false) {
                        enrollmentId = randomNo;
                        break;
                    }
                }

                const registerQueryTtc = `INSERT INTO t_event_participant_registration
                (event_id, user_id, school_grade, is_deleted, created_by, created_date, enrollment_id)
                VALUES($1, $2, $3, $4, $5, $6, $7) returning event_participant_registration_id;`


                let registerQueryValuesTtc = [
                    eventData.eventId,
                    ttcParticipant,
                   '',
                    false,
                    loggedInUser,
                    new Date().toUTCString(),
                    enrollmentId
                ];

                let result = await client.query(registerQueryTtc, registerQueryValuesTtc);
                let participantRegId = result.rows[0].event_participant_registration_id;

                console.log('inserted into t_event_participant_registration!, for event_participant_registration_id : ' + participantRegId +
                    ' and with enrollment Id: ' + enrollmentId);


                await client.query("COMMIT");

            }

        }
        return {
            "data": {
                status: 'success'
            }
        }


    } catch (error) {
        console.error(`reqOperations.js::eventRegistration() : ${error}`);
        await client.query('rollback');
        console.error(`Rolling back the operation due to the error.`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }
}

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
    getEventById,
    eventRegistration,
    getParticipant,
    getEventCatsAndStaffById
}