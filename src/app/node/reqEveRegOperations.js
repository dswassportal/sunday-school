const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);
const queries = require('./static/reqEveRegOperations_queries');
const common = require('./dbCommonUtills');


async function getEventDef(eventId, loggedInUserId, participantId, regMethod) {

    if (!eventId || !loggedInUserId) throw "getEventDef::invalid query parameters recived in request.";
    let client = await dbConnections.getConnection();

    try {

        //Get event section config.
        let response = {};
        let temp = {};
        let eveConfigRes = await client.query(queries.getEventSectionConfigByEveType, [eventId]);
        if (eveConfigRes.rowCount > 0)
            temp = eveConfigRes.rows[0].event_sec_config

        if ((temp.eventType === 'TTC'
            || temp.eventType === 'Sunday School Midterm Exam'
            || temp.eventType === 'Sunday School Final Exam') && regMethod === 'bulk') {

            //in case of Bulk registration
            console.debug(`Fetching data for bulk event registration on of event type '${temp.eventType}' for event ${eventId}`);
            await bulkRegistration(client, loggedInUserId, eventId)
                .then(data => response = data)
                .catch(error => { throw 'Error in reqEveRegOperations.js::bulkRegistration() as ' + error });;

        } else {
            //in case of indivisual registration
            console.debug(`Fetching data for indivisual event registration on of event type '${temp.eventType}' for event ${eventId}`);
            await getEventDefinationForIndivisualUser(client, eventId, participantId)
                .then(data => response = data)
                .catch(error => { throw 'Error in reqEveRegOperations.js::getEventDefinationForIndivisualUser() as ' + error });
        }

        response.sectionConfig = temp;


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

async function getEventDefinationForIndivisualUser(client, eventId, participantId) {

    let response = {};
    let result = await client.query(queries.getEventData, [eventId, participantId]);
    if (result.rowCount > 0) {
        for (let row of result.rows) {
            if (response.eventId == undefined) {
                response.name = row.event_name;
                response.eventId = row.event_id;
                response.role = row.role;
                response.registrationStatus = row.registration_status;
                response.eventPartiRegId = row.event_participant_registration_id;
                response.eventType = row.event_type;
                response.enrollmentId = row.enrollment_id;
                response.description = row.description;
                response.eventStartDate = row.start_date;
                response.eventEndDate = row.end_date;
                response.regStartDate = row.registration_start_date;
                response.regEndDate = row.registration_end_date;
                response.eventURL = row.event_url;
                response.selectedGroup = [
                    {
                        groupId: row.grade_group_id,
                        groupName: row.group_name
                    }
                ]

                response.categories = []
                if (row.event_cat_map_id) {
                    response.categories.push({
                        catName: row.cat_name,
                        catMapId: row.event_cat_map_id,
                        catId: row.event_category_id,
                        hasSelected: row.has_cat_selected
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

            } else {

                let catIndex = response.categories.findIndex((item) => item.catMapId == row.event_cat_map_id);
                if (catIndex === -1 && row.event_cat_map_id != null)
                    response.categories.push({
                        catName: row.cat_name,
                        catMapId: row.event_cat_map_id,
                        catId: row.event_category_id,
                        hasSelected: row.has_cat_selected
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

            }
        }
    }

    //Code to get roles from t_lookup
    response.participantRoles = [];
    let lookupRes = await client.query(queries.getParticipantRolesFormLookup);
    if (lookupRes.rowCount > 0)
        response.participantRoles = lookupRes.rows[0].parti_role;

    response.familyMembers = []
    //code to get family members of logged in User
    let famMemRes = await client.query(queries.getFamTreeWithEventRegStatus, [eventId, participantId]);
    if (famMemRes.rowCount > 0) {
        for (let member of famMemRes.rows) {
            response.familyMembers.push({
                'userId': member.user_id,
                'name': member.name,
                'relationship': member.relationship,
                'hasRegistered': member.has_registred,
                'registrationStatus': member.registration_status
            })
        }
    }
    response.gradeGroup = [];
    let groupRes = await client.query(queries.getGradeGroups, [eventId, participantId]);
    if (groupRes.rowCount > 0) {
        for (let row of groupRes.rows) {
            response.gradeGroup.push({
                'groupId': row.grade_group_id,
                'groupName': row.group_name
            })
        }
    }
    return response;
}

async function bulkRegistration(client, loggedInUser, eventId) {

    let staffData = [];
    let response = {}
    let result = await client.query(queries.getTTCEventData, [loggedInUser, eventId]);

    if (result.rowCount > 0) {

        for (let row of result.rows) {
            if (response.eventId === undefined) {
                response.name = row.event_name;
                response.eventId = row.event_id;
                response.eventType = row.event_type;
                response.description = row.description;
                response.eventStartDate = row.start_date;
                response.eventEndDate = row.end_date;
                response.regStartDate = row.registration_start_date;
                response.regEndDate = row.registration_end_date;
                response.selectedVenue = []

                let vicarRes = await client.query(queries.getVicarDetails, [loggedInUser])
                if (vicarRes.rowCount > 0) {
                    response.vicarName = vicarRes.rows[0].user_name;
                    response.vicaId = vicarRes.rows[0].user_id;
                }

                response.venues = [];
                let venueRes = await client.query(queries.getVenuesByEventId, [eventId])
                if (venueRes.rowCount > 0) {
                    for (let row of venueRes.rows) {
                        response.venues.push({
                            name: row.name,
                            eventVenueId: row.event_venue_id
                        })
                    }
                }
            }
            if (row.org_type === 'Parish') {
                staffData.push({
                    'orgName': row.org_name[0],
                    'orgId': row.org_id[0],
                    sundaySchools: []
                })
            }

            if (row.venue_id !== null && response.selectedVenue.length == 0) {
                response.selectedVenue.push({
                    venueId: row.venue_id,
                    eventVenueId: row.event_venue_id,
                    name: row.venue_name
                })
            }
        }


        for (let row of result.rows) {
            if (row.org_type === 'Sunday School') {
                if (staffData.length === 0) {
                    staffData.push({
                        sundaySchools: []
                    })
                }
                let pIndex = staffData.findIndex(item => item.orgId === row.parent_org_id)
                let sIndex = -1;
                if (pIndex === -1) {
                    // sIndex = 0
                    pIndex = 0
                } else sIndex = staffData[pIndex].sundaySchools.findIndex(item => item.schoolId === row.org_id)

                if (sIndex === -1) {
                    let temp = {
                        schoolName: row.org_name[0],
                        schoolId: row.org_id[0],
                        staff: []
                    };

                    if (row.role_type === 'Sunday School Principal') {
                        temp.principalName = row.user_name;
                        temp.principalEmailId = row.email_id;
                        temp.principalId = row.user_id;
                        temp.principalMobileNo = row.mobile_no;
                    } else if (row.role_type === 'Sunday School Vice Principal') {
                        temp.vicePrincipalName = row.user_name;
                        temp.vicePrincipalEmailId = row.email_id;
                        temp.vicePrincipalId = row.user_id;
                        temp.vicePrincipalMobileNo = row.mobile_no;
                    }

                    for (let innrow of result.rows) {
                        if (innrow.parent_org_id === row.org_id[0] && innrow.org_type === 'Grade' && innrow.user_id !== null) {
                            temp.staff.push({
                                staffName: innrow.user_name,
                                staffId: innrow.user_id,
                                grade: innrow.org_name,
                                emailId: innrow.email_id,
                                mobileNo: innrow.mobile_no,
                                registrationId: innrow.enrollment_id,
                                evePartiRegId: innrow.event_participant_registration_id,
                                registrationStatus: innrow.registration_status,
                                hasRegistered: innrow.has_registered,
                                registeredBy: innrow.registered_by,
                                registeredOn: innrow.registered_on,
                                eventVenueId: innrow.event_venue_id
                            })
                        }
                    }
                    staffData[pIndex].sundaySchools.push(temp);
                } else if (sIndex >= 0) {
                    if (row.role_type === 'Sunday School Principal') {
                        staffData[pIndex].sundaySchools[sIndex].principalName = row.user_name;
                        staffData[pIndex].sundaySchools[sIndex].principalEmailId = row.email_id;
                        staffData[pIndex].sundaySchools[sIndex].principalId = row.user_id;
                        staffData[pIndex].sundaySchools[sIndex].principalMobileNo = row.mobile_no;
                    } else if (row.role_type === 'Sunday School Vice Principal') {
                        staffData[pIndex].sundaySchools[sIndex].vicePrincipalName = row.user_name;
                        staffData[pIndex].sundaySchools[sIndex].vicePrincipalEmailId = row.email_id;
                        staffData[pIndex].sundaySchools[sIndex].vicePrincipalId = row.user_id;
                        staffData[pIndex].sundaySchools[sIndex].vicePrincipalMobileNo = row.mobile_no;
                    }
                }
            }
        }

    } else throw `No data data found for event ${eventId}.`
    response.staffData = staffData;


    let studentsData = [];
    let tempstudentsData = {};
    let resultStudents = await client.query(queries.getPrincipalwiseStudentsData, [loggedInUser, eventId]);
    if (resultStudents.rowCount > 0) {
        for (let row of resultStudents.rows) {

            tempstudentsData.schoolId = row.school_id;
            tempstudentsData.schoolName = row.school_name;
            tempstudentsData.studentId = row.student_id;
            tempstudentsData.studentName = row.student_name;
            tempstudentsData.schoolGrade = row.school_grade;
            tempstudentsData.hasSelected = row.has_selected;
            tempstudentsData.registrationId = row.enrollment_id;
            tempstudentsData.registeredBy = row.registered_by;
            tempstudentsData.registrationStatus = row.registration_status;
            tempstudentsData.evePartiRegId = row.event_participant_registration_id;
            tempstudentsData.staffId = row.teacher_user_id;
            tempstudentsData.staffName = row.teacher_name;
            tempstudentsData.registeredOn = row.registered_on;
            studentsData.push(tempstudentsData);
            tempstudentsData = {};
        }
    }

    if (studentsData.length == 0) {
        let resultStudentsData = await client.query(queries.getTeacherwiseStudentData, [loggedInUser, eventId]);
        if (resultStudentsData.rowCount > 0) {
            for (let row of resultStudentsData.rows) {
                tempstudentsData.schoolId = row.school_id;
                tempstudentsData.schoolName = row.school_name;
                tempstudentsData.studentId = row.student_id;
                tempstudentsData.studentName = row.student_name;
                tempstudentsData.schoolGrade = row.school_grade;
                tempstudentsData.hasSelected = row.has_selected;
                tempstudentsData.registrationId = row.enrollment_id;
                tempstudentsData.registeredBy = row.registered_by;
                tempstudentsData.registrationStatus = row.registration_status;
                tempstudentsData.evePartiRegId = row.event_participant_registration_id;
                studentsData.push(tempstudentsData);
                tempstudentsData = {};
            }
        }
        // else if(resultStudentsData.rowCount == 0){
        //     let resultStudentsData = await client.query(queries.getVicePrincipalwiseStudentsData, [loggedInUser, eventId]);
        //     if (resultStudentsData.rowCount > 0) {
        //         for (let row of resultStudentsData.rows) {
        //             tempstudentsData.schoolId = row.school_id;
        //             tempstudentsData.schoolName = row.school_name;
        //             tempstudentsData.studentId = row.student_id;
        //             tempstudentsData.studentName = row.student_name;
        //             tempstudentsData.schoolGrade = row.school_grade;
        //             tempstudentsData.hasSelected = row.has_selected;
        //             tempstudentsData.registrationId = row.enrollment_id;
        //             tempstudentsData.registeredBy = row.registered_by;
        //             tempstudentsData.registrationStatus = row.registration_status;
        //             tempstudentsData.evePartiRegId = row.event_participant_registration_id;
        //             studentsData.push(tempstudentsData);
        //             tempstudentsData = {};
        //         }
        //     }
        // }

    }
    response.studentsData = studentsData;


    let schools = [];
    let students = [];
    let tempSchools = {};
    let tempStudents = {};
    let schoolId = null;
    let resultStudentsData = await client.query(queries.getPrincipalwiseStudentsData, [loggedInUser, eventId]);

    if (resultStudentsData.rowCount > 0) {
        for (let row of resultStudentsData.rows) {
            if (row.school_id != schoolId) {
                tempSchools.schoolId = row.school_id;
                tempSchools.schoolName = row.school_name;
                schools.push(tempSchools);
                tempSchools = {};
                schoolId = row.school_id;
            }
        }

    }
    if (schools.length == 0) {
        let resultStudentsData = await client.query(queries.getTeacherwiseStudentData, [loggedInUser, eventId]);
        if (resultStudentsData.rowCount > 0) {
            for (let row of resultStudentsData.rows) {
                if (row.school_id != schoolId) {
                    tempSchools.schoolId = row.school_id;
                    tempSchools.schoolName = row.school_name;
                    schools.push(tempSchools);
                    tempSchools = {};
                    schoolId = row.school_id;
                }
            }
        }
        // else if(resultStudentsData.rowCount == 0){
        //     let resultStudentsData = await client.query(queries.getVicePrincipalwiseStudentsData, [loggedInUser, eventId]);
        //     if (resultStudentsData.rowCount > 0) {
        //         for (let row of resultStudentsData.rows) {
        //             if (row.school_id != schoolId) {
        //                 tempSchools.schoolId = row.school_id;
        //                 tempSchools.schoolName = row.school_name;
        //                 schools.push(tempSchools);
        //                 tempSchools = {};
        //                 schoolId = row.school_id;
        //             }
        //         }
        //     }
        // }
    }


    response.schools = schools;

    response.venues = [];
    let venueRes = await client.query(queries.getVenuesByEventId, [eventId])
    if (venueRes.rowCount > 0) {
        for (let row of venueRes.rows) {
            response.venues.push({
                name: row.name,
                eventVenueId: row.event_venue_id
            })
        }
    }


    return response;
}





async function eventRegistration(eventData, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        await client.query('begin;');
        let eventType = eventData.eventType;
        let registrationId = eventData.enrollmentId;

        if (eventData.regMethod !== 'bulk') {

            if (!eventData.registrationStatus) throw 'Registration status was not provided.'

            console.debug(`Registering for an event of type '${eventType}' and regMethod is '${eventData.regMethod}'.`);

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
                        [loggedInUser, new Date().toUTCString(), eventData.eveVenueId, eventData.registrationStatus,
                            eventData.role, eventData.group, eventData.eventPartiRegId]);

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
        } else {
            console.debug(`Registering for an event of type '${eventType}' and regMethod is '${eventData.regMethod}'.`);
            if (eventType === 'TTC' || eventType === 'Sunday School Midterm Exam' || eventType === 'Sunday School Final Exam' && eventData.regMethod === 'bulk') {
                console.debug('All conditions to for bulk registation are satisfied... Performing bulk registration now!')
                let bulkRegister = [];
                let eventPartiArr = [];

                for (let staff of eventData.staffRegistration) {

                    if (staff.evePartiRegId !== undefined && staff.evePartiRegId !== null) eventPartiArr.push(staff.evePartiRegId);

                    if (staff.evePartiRegId === undefined || staff.evePartiRegId === '' || staff.evePartiRegId === null ) {
                        let registrationId = await generateUniqueEnrollmentId(client);
                        bulkRegister.push(`( ${eventData.eventId}, ${staff.staffId}, ${null}, ${false}, ${loggedInUser},
                                                             '${new Date().toUTCString()}', '${registrationId}', ${eventData.eventVenueId}, 'Registered', ${null})`);
                    }
                }
                // Update event registration
                if (eventPartiArr.length > 0) {

                    let regIdString = eventPartiArr.join(',');
                    //To handle unselected teacher's bulk registration
                    let tempQ1 = queries.cancelTTCRegistation.replace('$5', regIdString);
                    let cancelBulkTTCRes = await client.query(tempQ1, [loggedInUser, new Date().toUTCString(), 'Canceled', eventData.eventId]);
                    if (cancelBulkTTCRes.rowCount > 0)
                        console.debug(`for event ${eventData.eventId}, canceled event_participant_registration_ids are: ${JSON.stringify(cancelBulkTTCRes.rows)}`);

                    // to handele update of registration
                    let tempQ2 = queries.updateTTCRegistration.replace('$5', regIdString);
                    let updateBulkTTCRes = await client.query(tempQ2, [loggedInUser, new Date().toUTCString(), eventData.eventVenueId, 'Registered']);
                    if (updateBulkTTCRes.rowCount > 0)
                        console.debug(`for event ${eventData.eventId}, Updated event_participant_registration_ids are: ${JSON.stringify(updateBulkTTCRes.rows)}`);

                }

                // Create new  event registration
                if (bulkRegister.length > 0) {
                    let tempQuery = queries.bulkInsertNewRegistration.replace('$1', bulkRegister.join(','))
                    console.debug(tempQuery);
                    let regBulkTTCRes = await client.query(tempQuery);
                    if (regBulkTTCRes.rowCount > 0)
                        console.debug(`for event ${eventData.eventId}, performed bulk registration and event_participant_registration_ids are : ${JSON.stringify(regBulkTTCRes.rows)}`);
                }

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
        //let generatedNo = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        let generatedNo = common.generateRandomString(6);
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