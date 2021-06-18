const { query } = require('@angular/animations');
const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);
const queries = require('./static/reqEveRegOperations_queries');



async function getEventDef(eventId, loggedInUserId) {

    if (!eventId || !loggedInUserId) throw "getEventDef::invalid query parameters recived in request.";
    let client = await dbConnections.getConnection();
    try {
        let response = {};
        let result = await client.query(queries.getEventData, [eventId, loggedInUserId]);
        if (result.rowCount > 0) {
            for (let row of result.rows) {
                if (response.eventId == undefined) {
                    response.name = row.event_name;
                    response.eventId = row.event_id;
                    response.role = row.role;
                    response.eventPartiRegId = row.event_participant_registration_id;
                    response.eventType = row.event_type;
                    response.enrollmentId = row.enrollment_id;
                    response.description = row.description;
                    response.eventStartDate = row.start_date;
                    response.eventEndDate = row.end_date;
                    response.regStartDate = row.registration_start_date;
                    response.regEndDate = row.registration_end_date;
                    response.eventURL = row.event_url;

                    response.categories = []
                    if (row.event_cat_map_id) {
                        response.categories.push({
                            catName: row.cat_name,
                            catMapId: row.event_cat_map_id,
                            catId: row.event_category_id
                        })
                    }

                    response.attachments = []
                    if (row.event_attachment_id) {
                        response.attachments.push({
                            attName: row.attachment_name,
                            attType: row.attachment_type,
                            attId: row.event_attachment_id,
                            attFileName: row.file_name
                        })
                    }

                    response.venues = []
                    if (row.event_venue_id) {
                        response.venues.push({
                            venueId: row.venue_id,
                            venueMapId: row.event_venue_id,
                            venueName: row.venue_name
                        })
                    }

                    response.questionnaire = []
                    if (row.question_id) {
                        response.questionnaire.push({
                            queId: row.question_id,
                            question: row.question,
                            answerType: row.answer_type,
                            answer: row.answer
                        })
                    }

                    response.selectedVenue = []
                    if (row.selected_event_venue_id !== null) {
                        response.selectedVenue.push({
                            venueId: row.venue_id,
                            venueMapId: row.event_venue_id,
                            venueName: row.venue_name
                        })
                    }

                    response.selectedCats = []
                    if (row.selected_cat !== null) {
                        response.selectedCats.push({
                            catName: row.cat_name,
                            catMapId: row.event_cat_map_id,
                            catId: row.event_category_id
                        })
                    }
                } else {

                    let catIndex = response.categories.findIndex((item) => item.catMapId == row.event_cat_map_id);
                    if (catIndex === -1 && row.event_cat_map_id != null)
                        response.categories.push({
                            catName: row.cat_name,
                            catMapId: row.event_cat_map_id,
                            catId: row.event_category_id
                        })

                    let attIndex = response.attachments.findIndex((item) => item.attId == row.event_attachment_id);
                    if (attIndex === -1 && row.event_attachment_id != null)
                        response.attachments.push({
                            attName: row.attachment_name,
                            attType: row.attachment_type,
                            attId: row.event_attachment_id,
                            attFileName: row.file_name
                        })

                    let venIndex = response.venues.findIndex((item) => item.venueMapId == row.event_venue_id);
                    if (venIndex === -1)
                        response.venues.push({
                            venueId: row.venue_id,
                            venueMapId: row.event_venue_id,
                            venueName: row.venue_name
                        });

                    let queIndex = response.questionnaire.findIndex((item) => item.queId == row.question_id);
                    if (queIndex === -1)
                        response.questionnaire.push({
                            queId: row.question_id,
                            question: row.question,
                            answerType: row.answer_type,
                            answer: row.answer
                        })

                    let selCatIndex = response.selectedCats.findIndex((item) => item.catMapId == row.selected_cat);
                    if (selCatIndex === -1 && row.selected_cat != null)
                        response.selectedCats.push({
                            catName: row.cat_name,
                            catMapId: row.event_cat_map_id,
                            catId: row.event_category_id
                        })


                }
            }
        }


        //Code to get roles from t_lookup
        response.participantRoles = [];
        let lookupRes = await client.query(queries.getParticipantRolesFormLookup);
        if (lookupRes.rowCount > 0)
            response.participantRoles = lookupRes.rows[0].parti_role;

        //Get event section config.
        response.sectionConfig = {};
        let eveConfigRes = await client.query(queries.getEventSectionConfigByEveType, [response.eventType]);
        if (eveConfigRes.rowCount > 0)
            response.sectionConfig = eveConfigRes.rows[0].event_sec_config

        return {
            data: {
                status: "success",
                eventData: response
            }
        }

    } catch (error) {
        console.error(`reqEveRegOerations.js::getEventDef() --> error as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }

}


async function eventRegistration(eventData, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        await client.query('begin;');
        let eventType = eventData.eventType;
        let registrationId = eventData.enrollmentId;

        if(!eventData.registrationStatus) throw 'Registration status was not provided.'
        
        if (eventData.enrollmentId === null || eventData.enrollmentId === undefined) {
            //Case when there is a new registration.(t_event_participant_registration)
            registrationId = await generateUniqueEnrollmentId(client);
            let newRegRes = await client.query(queries.newRegistration,
                [eventData.eventId, eventData.participantId, eventData.group,
                    false, loggedInUser, new Date().toUTCString(),
                    registrationId, eventData.eveVenueId, eventData.registrationStatus, eventData.role]);

            if (newRegRes.rowCount > 0) {

                let participantRegId = newRegRes.rows[0].event_participant_registration_id;
                console.log(`Participant ${eventData.participantId} registering for event ${loggedInUser}, event_participant_registration_id  is ${participantRegId}`);

                // inserting categories selected by the participant.  (t_participant_event_reg_cat)       
                if (eventData.categories) {
                    let registerEvtCatQueryValues = []
                    for (let catId of eventData.categories)
                        registerEvtCatQueryValues.push(`( ${participantRegId}, ${catId}, ${eventData.participantId}, ${false}, ${loggedInUser}, '${new Date().toUTCString()}' )`);

                    if (registerEvtCatQueryValues.length > 0) {
                        let tempQuery = queries.insertRegCatMapping.replace('$1', registerEvtCatQueryValues.join(','))
                        let regCatRes = await client.query(tempQuery);
                        if (regCatRes.rowCount > 0)
                            console.debug(`for participant ${eventData.participantId} categories mapped , participant_event_reg_cat_ids are : ${JSON.stringify(regCatRes.rows)}`);
                    } else console.log("No categories were found to process.");
                }

                // inserting question and their responses filled by the participant.  (t_event_question_response) 
                if (eventData.questionnaire) {
                    let insertQueRespValues = [];
                    for (let question of eventData.questionnaire)
                        insertQueRespValues.push(`(${participantRegId}, ${question.questionId}, '${question.answer}', ${eventData.participantId}, '${new Date().toUTCString()}')`);

                    if (insertQueRespValues.length > 0) {
                        let tempQuery = queries.insertRegQueResp.replace('$1', insertQueRespValues.join(','))
                        let regQueRes = await client.query(tempQuery);
                        if (regQueRes.rowCount > 0)
                            console.debug(`for participant ${eventData.participantId} questions answers , participant_event_reg_cat_ids are : ${JSON.stringify(regQueRes.rows)}`);
                    } else console.log(" No questionnaire were found to process.");
                }
            }
        } else if (eventData.enrollmentId !== null || eventData.enrollmentId !== undefined) {

            console.log(`Updating event registration for ${eventData.enrollmentId} enrollmentId`);
            //Updating existing event registration.(t_event_participant_registration)
            if (eventData.eventPartiRegId && eventData.registrationStatus) {
                let regUpdateRes = await client.query(queries.updateEventRegistration,
                    [loggedInUser, new Date().toUTCString(), eventData.eveVenueId, eventData.registrationStatus, eventData.role. eventData.eventPartiRegId]);

                if (regUpdateRes.rowCount > 0)
                    console.debug(`Event registration updated for ${eventData.eventPartiRegId} event_participant_registration_id.`);
            } else throw `For registred event ${eventData.eventId} and pariticipant ${eventData.participantId}, eventPartiRegId Or registrationStatus not recived from the payload JSON.`

            //Updating categories of registration.(t_participant_event_reg_cat)
            if (eventData.categories) {
                if (eventData.categories.length > 0) {
                    let tempQuery = queries.deleteCatMapping.replace('$5', eventData.categories)
                    let delCatRes = await client.query(tempQuery,
                        [true, loggedInUser, new Date().toUTCString(), eventData.eventPartiRegId]);

                    if (delCatRes.rowCount > 0)
                        console.log(`for ${eventData.participantId}, deleted categories are ${delCatRes.rows}`);

                    let newAddCats = [];
                    for (let eventCatId of eventData.categories) {
                        let regCatRes = await client.query(queries.updateEventRegCatMapping,
                            [eventData.eventPartiRegId, eventCatId, eventData.participantId, false, loggedInUser, new Date().toUTCString()]);
                        if (regCatRes.rowCount > 0)
                            newAddCats.push(regCatRes.rows[0].participant_event_reg_cat_id);
                    }
                    console.debug(`for ${eventData.participantId}, newly selected category mappings are ${newAddCats}`)
                }

                //Updating questionnaire for registration.(t_event_question_response)
                if (eventData.questionnaire) {
                    if (eventData.questionnaire.length > 0) {
                        let udtedQueRes = [];
                        for (let question of eventData.questionnaire) {
                            let queResUpdtdRes = await client.query(queries.updateRegQuestionRes,
                                [question.answer, loggedInUser, new Date().toUTCString(), eventData.eventPartiRegId, question.questionId]);
                            if (queResUpdtdRes.rowCount > 0)
                                udtedQueRes.push(queResUpdtdRes.rows[0].question_response_id);
                        }
                        console.debug(`for ${eventData.participantId}, updated question responces!, question_response_ids are ${udtedQueRes}`)

                    }
                }

            }


        }


        await client.query('commit;')
        if (eventType === 'TTC') {
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
                status: 'success',
                enrollmentId: registrationId
            }
        }


    } catch (error) {
        console.error(`reqEveRegOperations.js::eventRegistration() : ${error}`);
        await client.query('rollback;');
        console.error(`Rolling back the operation due to the error.`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release(false);
    }
}

async function generateUniqueEnrollmentId(client) {

    for (let i = 0; i < 50; i++) {
        let generatedNo = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        let ranNoResult = await client.query(queries.checkGeneratedEnrollmentNoExists,
            [generatedNo]);
        if (ranNoResult.rows[0].ran_no == false) {
            return generatedNo;
        }
    }
    throw "System was not able to generate unique enrollment id in 50 attempts."
}

module.exports = {
    getEventDef,
    eventRegistration
}