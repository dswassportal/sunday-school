const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);
const queries = require(`${__dirname}/static/event_queries`);

async function deleteEvents(eventsData) {
    let client = await dbConnections.getConnection();
    console.log("User Data" + JSON.stringify(eventsData));
    try {
        await client.query("BEGIN");
        try {
            if (eventsData) {
                for (let event of eventsData) {

                    console.log("event.event_Id", event.event_Id);
                    //t_event
                    const deleteTblEvent = `UPDATE t_event SET is_deleted = true WHERE event_id = ${event.event_Id};`
                    await client.query(deleteTblEvent);

                    //t_event_venue
                    let deleteTblEventVenue = `UPDATE t_event_venue SET is_deleted = true where event_id = ${event.event_Id};`
                    await client.query(deleteTblEventVenue);

                    //t_event_cat_staff_map
                    let deleteTblEventCatStaffMap = `UPDATE t_event_cat_staff_map SET is_deleted = true where event_id = ${event.event_Id};`
                    await client.query(deleteTblEventCatStaffMap);

                    //t_event_questionnaire
                    let deleteTblEventQuestionnaire = `UPDATE t_event_questionnaire SET is_deleted = true where event_id = ${event.event_Id};`
                    await client.query(deleteTblEventQuestionnaire);
                }

                console.log("Before commit");
                await client.query("COMMIT");

                return ({
                    data: {
                        status: 'success'
                    }
                });
            }
        }
        catch (err) {
            await client.query("ROLLBACK");
            console.error(`reqOperations.js::deleteEvents() --> error : ${JSON.stringify(err)}`)
            console.log("Transaction ROLLBACK called");
            return (errorHandling.handleDBError('transactionError'));
        }
    } catch (error) {
        console.error(`reqOperations.js::deleteEvents() --> error : ${JSON.stringify(err)}`);
        return (errorHandling.handleDBError('transactionError'));
    } finally {
        client.release();
    }

}

async function updateEvent(eventsData) {

    let client = await dbConnections.getConnection();
    try {
        await client.query("BEGIN");
        /********************** t_event*******************************************************************************************/
        const updateEvent = `UPDATE t_event
            SET "name"=$1, event_type=$2, description=$3, start_date=$4, end_date=$5,
                 registration_start_date=$6, registration_end_date=$7, updated_by=$8, updated_date=$9, event_url = $10
            WHERE event_id = $11;`
        const updateEventValues = [
            eventsData.name,
            eventsData.eventType,
            eventsData.description,
            eventsData.startDate,
            eventsData.endDate,
            eventsData.registrationStartDate,
            eventsData.registrationEndDate,
            eventsData.updatedBy,
            new Date().toUTCString(),
            eventsData.eventUrl,
            eventsData.eventId
        ];
        await client.query(updateEvent, updateEventValues);


        ///////////////////////////////////////////// t_event_organization ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let deleteOrgIdQuery = `DELETE FROM t_event_organization where event_id = ${eventsData.eventId};`
        await client.query(deleteOrgIdQuery);

        if (eventsData.orgId) {
            for (let org of eventsData.orgId) {
                console.log("org", org);
                const insertOrgTypeData = `INSERT INTO t_event_organization(event_id, org_type, org_id) VALUES($1, $2, $3);`
                insertOrgTypeDataValues = [
                    eventsData.eventId,
                    eventsData.orgType,
                    org
                ];
                console.log("insertOrgTypeDataValues", insertOrgTypeDataValues);
                await client.query(insertOrgTypeData, insertOrgTypeDataValues);
            }
        }

        ////////////////////////////////////////////  t_event_coordinator  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const deleteEventCoordinator = `DELETE FROM t_event_coordinator where event_id = ${eventsData.eventId};`
        await client.query(deleteEventCoordinator);

        if (eventsData.eventCoordinator) {
            for (let coordinator of eventsData.eventCoordinator) {
                const insertEventCoordinator = `INSERT INTO t_event_coordinator (event_id, user_id, updated_date) VALUES($1, $2, $3);`
                insertEventCoordinatorValues = [
                    eventsData.eventId,
                    coordinator,
                    new Date().toISOString()
                ];
                await client.query(insertEventCoordinator, insertEventCoordinatorValues);
            }
        }

        ////////////////////////////////////////////  t_event_venue  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        console.log("111");
        let updatedAndInsertedVenues = [];
        if (eventsData.venues) {
            for (let venue of eventsData.venues) {
                if (venue.eventVenueId) {

                    const updateVenueQuery = `UPDATE t_event_venue SET venue_id = $1, proctor_id = $2
                                         where event_venue_id = ${venue.eventVenueId} and is_deleted = false and event_id = ${eventsData.eventId};`
                    updateVenueValues =
                        [
                            venue.venueId,
                            venue.proctorId
                        ]
                    if (venue.venueId) {
                        await client.query(updateVenueQuery, updateVenueValues);
                        updatedAndInsertedVenues.push(venue.eventVenueId);
                        console.log("updatedAndInsertedVenues", updatedAndInsertedVenues);
                    }
                }
                else if (!venue.eventVenueId) {

                    const insertVenueQuery = `INSERT INTO t_event_venue(event_id, venue_id, proctor_id)
                                            VALUES ($1, $2, $3) returning event_venue_id;`
                    insertVenueValues =
                        [
                            eventsData.eventId,
                            venue.venueId,
                            venue.proctorId
                        ]
                    if (venue.venueId != "") {
                        let result = await client.query(insertVenueQuery, insertVenueValues);
                        this.eventVenueID = result.rows[0].event_venue_id;
                        updatedAndInsertedVenues.push(this.eventVenueID);
                        console.log("updatedAndInsertedVenues", updatedAndInsertedVenues);
                    }
                }
            }
            if (updatedAndInsertedVenues.length > 0) {
                let existingVenueString = updatedAndInsertedVenues.join(',');
                const deleteVenuesQuery = `UPDATE t_event_venue SET is_deleted = true where event_venue_id not in (${existingVenueString}) and event_id = ${eventsData.eventId};`
                await client.query(deleteVenuesQuery);
            }
        }


        ///////////////////////////////////////  t_event_category_map  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log("4");

        let updatedNInsertedEventCatMapIds = [];
        if (eventsData.categories != null) {
            let eventCatMapId;

            for (let category of eventsData.categories) {
                if (category.eventCatMapId) {
                    console.log("6");
                    eventCatMapId = category.eventCatMapId;
                    updatedNInsertedEventCatMapIds.push(category.eventCatMapId);
                    console.log(updatedNInsertedEventCatMapIds);
                }
                else if (!category.eventCatMapId) {
                    console.log("7");
                    const insertCategory = `INSERT INTO t_event_category_map(event_id, event_category_id)
                                            VALUES ($1, $2) returning event_cat_map_id;`
                    insertCategory_value =
                        [
                            eventsData.eventId,
                            category.eventCategoryID
                        ]
                    let result = await client.query(insertCategory, insertCategory_value);
                    eventCatMapId = result.rows[0].event_cat_map_id;
                    updatedNInsertedEventCatMapIds.push(eventCatMapId);
                    console.log(updatedNInsertedEventCatMapIds);
                }


                let deleteVenueMap = `DELETE FROM t_event_category_venue_map where event_cat_map_id = ${eventCatMapId};`
                await client.query(deleteVenueMap);

                for (let venue of category.venueId) {
                    console.log("venue", venue);
                    const eventCatVenueMap = `INSERT INTO t_event_category_venue_map(event_cat_map_id, event_venue_id) VALUES ($1, $2);`
                    eventCatVenueMapValues = [
                        eventCatMapId,
                        venue
                    ]
                    await client.query(eventCatVenueMap, eventCatVenueMapValues);
                }


                if (category.judges.length) {

                    let existingJudgesString = category.judges.join(',');

                    let deleteEventCatVenueMapQuery = `DELETE FROM t_event_cat_staff_map where event_id = ${eventsData.eventId} 
                                                       and event_category_map_id = ${eventCatMapId} and user_id not in (${existingJudgesString});`
                    await client.query(deleteEventCatVenueMapQuery);
                    for (let judge of category.judges) {

                        const insertCatUserMap = `insert into t_event_cat_staff_map (event_id, event_category_map_id, user_id, role_type)
                                                  select ${eventsData.eventId} ,${eventCatMapId}, ${judge}, 'Judge'
                                                  where not exists 
                                                  (select event_cat_staff_map_id from t_event_cat_staff_map 
                                                  where event_id = ${eventsData.eventId} and event_category_map_id = ${eventCatMapId}  and user_id = ${judge});`

                        await client.query(insertCatUserMap);

                    }
                }
            }
            if (updatedNInsertedEventCatMapIds.length > 0) {

                let existingEventCatMapIds = updatedNInsertedEventCatMapIds.join(',');
                console.log("existingEventCatMapIds", existingEventCatMapIds);
                const deleteEventCatMapIdsQuery = `DELETE FROM t_event_category_map where event_cat_map_id not in (${existingEventCatMapIds}) and event_id = ${eventsData.eventId};`
                await client.query(deleteEventCatMapIdsQuery);
            }
        }



        /********************** t_event_questionnaire ************************************************************************************/


        let updatedAndInsertedQuestions = [];
        if (eventsData.questionnaire) {
            for (let question of eventsData.questionnaire) {
                console.log("question.questionId", question.questionId);
                if (question.questionId) {

                    const insertQuestionare = `UPDATE t_event_questionnaire SET question = $1, answer_type = $2, is_deleted = $3
                                               where question_id = ${question.questionId} and event_id = ${eventsData.eventId};`
                    insertQuestionareValue =
                        [
                            question.question,
                            question.responseType,
                            false
                        ]
                    await client.query(insertQuestionare, insertQuestionareValue);
                    updatedAndInsertedQuestions.push(question.questionId);
                    console.log("updatedAndInsertedQuestions", updatedAndInsertedQuestions);

                }
                else if (!question.questionId) {

                    const insertQuestionare = `INSERT INTO t_event_questionnaire(event_id, question, answer_type)
                                               VALUES ($1, $2, $3) returning question_id;`
                    insertQuestionareValue =
                        [
                            eventsData.eventId,
                            question.question,
                            question.responseType

                        ]
                    let result = await client.query(insertQuestionare, insertQuestionareValue);
                    this.questionId = result.rows[0].question_id;
                    updatedAndInsertedQuestions.push(this.questionId);
                }
            }
            if (updatedAndInsertedQuestions.length > 0) {
                let existingQuestionsString = updatedAndInsertedQuestions.join(',');
                const deleteQuestionsQuery = `UPDATE t_event_questionnaire SET is_deleted = true where question_id not in (${existingQuestionsString}) and event_id = ${eventsData.eventId};`
                await client.query(deleteQuestionsQuery);
            }
        }



        if (eventsData) {
            const updateTtcExamDates = `UPDATE t_event_exam_date SET exam_start_date = $1, exam_end_date = $2
            where event_id = ${eventsData.eventId};`
            updateTtcExamDatesValues =
                [
                    eventsData.ttcExamStartDate,
                    eventsData.ttcExamEndDate
                ]
            if (eventsData.ttcExamStartDate) {
                await client.query(updateTtcExamDates, updateTtcExamDatesValues);
            }
        }

        console.log("Before commit");
        await client.query("COMMIT");

        return ({
            data: {
                status: 'success'
            }
        })


    }
    catch (err) {
        await client.query("ROLLBACK");
        console.error(`eventReqOperations.js::UpdateEvent() --> error : ${err}`)
        console.log("Transaction ROLLBACK called");
        return (errorHandling.handleDBError('transactionError'));
    } finally {
        client.release()
    }
}

async function getVenues(venueData) {

    let client = await dbConnections.getConnection();
    try {

        let orgId = [];
        orgId = venueData.orgId.join(',');
        console.log("orgId", orgId);


        let getVenuesQuery = `select jsonb_build_object( 'venueId' , tv.venue_id, 
                             'venueName', tv."name") as res_row
                              from t_organization to2 , t_venue tv 
                              where tv.org_id = to2.org_id and to2.org_id in
                            (        
	                            with recursive child_orgs as (
	                            select parent_org.org_id org_id
	                            from t_organization parent_org
	                            where org_id in (${orgId}) 
	                            and org_type = '${venueData.orgType}' 
	                            union
	                            select child_org.org_id child_id
	                            from t_organization child_org
	                            inner join child_orgs c on c.org_id = child_org.parent_org_id
	                        )   select org_id from child_orgs
                        );`;

        let res = await client.query(getVenuesQuery);
        let consolidatedData = [];
        if (res && res.rowCount > 0) {
            for (let row of res.rows)
                consolidatedData.push(row.res_row);
        }

        return ({
            data: {
                status: 'success',
                venueList: consolidatedData
            }
        })

    } catch (error) {
        console.error(`eventReqOperations.js::getVenues() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }

}

async function insertEvents(eventsData, loggedInUser) {

    let client = await dbConnections.getConnection();

    try {
        await client.query("BEGIN");

        let eventId = eventsData.eventId;
        let response = { eventId: eventsData.eventId }
        console.log(`Processing request for ${eventsData.eventId} event Id and ${eventsData.sectionCode == undefined
            ? ' to get ' + eventsData.nextSectionCode + ' section data '
            : ' to process ' + eventsData.sectionCode + ' section '}`);
        switch (eventsData.sectionCode) {

            // To populated event form's general section.
            case "event_details": {

                //Logic :  if event id present in JSON then update the event record else create new one and return its event_id.
                if (eventsData.eventId) {
                    console.log(`Updating event ${eventsData.eventId}`);
                    const updateEventValues = [
                        eventsData.name, eventsData.eventType, eventsData.description,
                        eventsData.startDate, eventsData.endDate, eventsData.registrationStartDate,
                        eventsData.registrationEndDate, loggedInUser, new Date().toUTCString(),
                        eventsData.eventUrl, eventsData.eventId
                    ];

                    //Query to update into t_event table
                    let result = await client.query(queries.updateEvent, updateEventValues);
                    console.log(`Event defination has been create Updated for event : ${eventsData.eventId},
                                         Row updated : ${result.rowCount}`);

                    //Query to delete t_event_organization table records for given event ID
                    await client.query(queries.deleteEventOrgs, [eventsData.eventId]);
                    let eventOrgId = [];
                    if (eventsData.orgId) {
                        for (let org of eventsData.orgId) {
                            let insertOrgTypeDataValues = [eventsData.eventId, eventsData.orgType, org];
                            result = await client.query(queries.insertEventOrgs, insertOrgTypeDataValues);
                            eventOrgId.push(result.rows[0].event_organization_id);
                        }
                    }
                    console.log(`Event ${eventsData.eventId}, updated event_organization_ids are  : ${JSON.stringify(eventOrgId)}`);

                    // Delete all event co-ordinators for provided event.
                    await client.query(queries.deleteEventCords, [eventsData.eventId]);

                    let cordArr = []
                    if (eventsData.eventCoordinator) {
                        for (let coordinator of eventsData.eventCoordinator) {
                            let insertEventCoordinatorValues = [eventsData.eventId, coordinator, loggedInUser, new Date().toUTCString()];
                            result = await client.query(queries.insertEventCords, insertEventCoordinatorValues);
                            cordArr.push(result.rows[0].event_coordinator_id)
                        }
                    }
                    console.log(`Event ${eventsData.eventId}, updated event_coordinator_ids are  : ${JSON.stringify(cordArr)}`);
                } else {    //If eventID present in request 
                    console.log(`Creating new event of type ${eventsData.eventType}`);
                    const insertEventValues = [
                        eventsData.name, eventsData.eventType, eventsData.description,
                        eventsData.startDate, eventsData.endDate, eventsData.registrationStartDate,
                        eventsData.registrationEndDate, loggedInUser, new Date().toUTCString(),
                        eventsData.eventUrl
                    ];
                    //Query to insert into t_event table
                    let result = await client.query(queries.insertEvent, insertEventValues);
                    response.eventId = eventId = result.rows[0].event_id;
                    console.log("Event defination has been created, New event Id is : " + eventId);

                    // To populate orgnizations
                    let eventOrgId = [];
                    if (eventsData.orgId) {
                        for (let org of eventsData.orgId) {
                            insertOrgTypeDataValues = [eventId, eventsData.orgType, org];
                            //Query to insert into t_event_organization table
                            result = await client.query(queries.insertEventOrgs, insertOrgTypeDataValues);
                            eventOrgId.push(result.rows[0].event_organization_id);
                        }
                    }
                    console.log(`Event ${eventId}, new event_organization_ids are  : ${JSON.stringify(eventOrgId)}`);

                    // To populate co-ordinators
                    let cordArr = []
                    if (eventsData.eventCoordinator) {
                        for (let coordinator of eventsData.eventCoordinator) {
                            let insertEventCoordinatorValues = [eventId, coordinator, loggedInUser, new Date().toUTCString()];
                            result = await client.query(queries.insertEventCords, insertEventCoordinatorValues);
                            cordArr.push(result.rows[0].event_coordinator_id)
                        }
                    }//Co-ordinator check if
                    console.log(`Event ${eventId}, new event_coordinator_ids are  : ${JSON.stringify(cordArr)}`);
                }//else
                break;
            }// event_details case block
            // To persist event form's event categories section.
            case "event_categories": {

                if (eventsData.categories) {
                    let catMapIds = []

                    // ------------------  Unselected cat Deletion logic Starts here---------------------------//
                    let listOfCatMapIds = []
                    eventsData.categories.forEach((item) => { if (item.catMapId) listOfCatMapIds.push(item.catMapId) });
                    if (listOfCatMapIds.length > 0) {
                        tempQuery = queries.deleteCategoryMapping.replace('$2', listOfCatMapIds.join(','))
                        result = await client.query(tempQuery, [eventsData.eventId]);
                        console.log(`for event ${eventsData.eventId}, row deleted for categories: ${result.rowCount}`);
                    }
                    // ------------------  Unselected cat Deletion logic Ends here ---------------------------//

                    for (let category of eventsData.categories) {
                        if (category.catId) {
                            let result = await client.query(queries.insertCatMap, [eventsData.eventId, category.catId]);
                            if (result.rows[0])
                                catMapIds.push(result.rows[0].event_cat_map_id);
                        } else if (category.catId == undefined || category.catId == null || category.catId == "") {
                            console.log(`Seems like user added new cateogry named as ${category.catName}, Adding it to t_event_category for event type ${eventsData.eventType}`);

                            //Insert new category in the t_event_category table
                            let insertNewCategory = await client.query(queries.insertNewCategory,
                                [category.catName, category.catDesc, eventsData.eventType, eventsData.eventType]);

                            let newCatId = insertNewCategory.rows[0].event_category_id;
                            console.log(`event_category_id for newly added  category is  ${newCatId}`);

                            let result = await client.query(queries.insertCatMap, [eventsData.eventId, newCatId]);
                            if (result.rows[0])
                                catMapIds.push(result.rows[0].event_cat_map_id);
                        }
                    }
                    console.log(`Event ${eventsData.eventId}, new event_cat_map_ids are  : ${JSON.stringify(catMapIds)}`);
                }
            }// event_categories case block
                break;
            //To persist event groups
            case "event_groups": {
                if (eventsData.groups) {
                    // ------------------  Unselected group Deletion logic Starts here---------------------------//
                    let listOfEveGrpMapIds = []
                    eventsData.groups.forEach((item) => { if (item.eventGradeGroupMapId) listOfEveGrpMapIds.push(item.eventGradeGroupMapId) });
                    if (listOfEveGrpMapIds.length > 0) {
                        let tempQuery = queries.deleteGroupMapping.replace('$2', listOfEveGrpMapIds.join(','))
                        let result = await client.query(tempQuery, [eventsData.eventId]);
                        console.log(`for event ${eventsData.eventId}, row deleted for groups mapping: ${result.rowCount}`);
                    }
                    // ------------------  Unselected group Deletion logic Ends here---------------------------//

                    let gradeGroupMapIds = [];
                    for (let group of eventsData.groups) {
                        if (group.gradeGroupId) {
                            //query to insert grade group mapping.
                            let result = await client.query(queries.insertGradeGroupMapping,
                                [eventsData.eventId, group.gradeGroupId, loggedInUser, new Date().toUTCString()]);
                            if (result.rows[0])
                                gradeGroupMapIds.push(result.rows[0].event_grade_group_map_id);
                        } else if (group.gradeGroupId == undefined || group.gradeGroupId == null || group.gradeGroupId == "") {
                            if (typeof group.gradeGroupName != undefined && typeof group.gradeGroupName != undefined) {
                                console.log(`Seems like user added new group as ${group.gradeGroupName}, Adding it to t_grade_group & t_grade_group_detail`);
                                let result = await client.query(queries.insertGradeGroup,
                                    [group.gradeGroupName, loggedInUser, new Date().toUTCString()]);
                                let newGroupId = result.rows[0].grade_group_id;
                                for (let grade of group.grades) {
                                    //Mapping group to grades in t_grade_group_detail table.
                                    await client.query(queries.insertGradeGroupDtl, [newGroupId, grade])
                                }
                                result = await client.query(queries.insertGradeGroupMapping,
                                    [eventsData.eventId, newGroupId, loggedInUser, new Date().toUTCString()]);
                                if (result.rows[0])
                                    gradeGroupMapIds.push(result.rows[0].event_grade_group_map_id);
                            } else throw "New groupName is empty. ";
                        }
                    }
                    console.log(`Event ${eventsData.eventId}, new event_grade_group_map_ids are  : ${JSON.stringify(gradeGroupMapIds)}`);
                }
                break;
            }//event_groups case block
            case "event_cat_group_map": {
                if (eventsData.catGradeMap) {

                    // to Delete previous mapping and insert new mapping logic starts here
                    let catMapIds = []
                    eventsData.catGradeMap.forEach((item) => { if (item.catMapId) catMapIds.push(item.catMapId) });
                    if (catMapIds.length > 0) {
                        let tempQuery = queries.deleteCatGroupMapping.replace('$4', catMapIds.join(','))
                        let result = await client.query(tempQuery,
                            [true, loggedInUser, new Date().toUTCString()]);
                        console.log(`for event ${eventsData.eventId},Row count of deleted(Soft) cat-groups mappings are: ${result.rowCount}`);
                    }
                    //deletion logic ends here.

                    let catGrpMapIds = []
                    for (let catGrp of eventsData.catGradeMap) {// to iterate catGradeMap
                        if (catGrp.groupMapIds) {
                            for (let groupMap of catGrp.groupMapIds) { // to iterate groupMapIds        
                                let result = await client.query(queries.insertCatGradeMapping,
                                    [catGrp.catMapId, groupMap.gradeGroupMapId, loggedInUser, new Date().toUTCString()]);
                                if (result.rows[0])
                                    catGrpMapIds.push(result.rows[0].event_cat_grade_grp_map_id)
                            }// inner for
                        }// if catGrp.groupMapIds
                    }// outer for
                    console.log(`Event ${eventsData.eventId}, new event_cat_grade_grp_map_ids are  : ${JSON.stringify(catGrpMapIds)}`);
                }// if
            }
            case "event_venue_assignment": {
                if (eventsData.venues) {

                    // To delete venue logic starts here//
                    if (eventsData.venues.length > 0) {
                        let tempQuery = queries.deleteVenues.replace('$2', eventsData.venues.join(','));
                        let result = await client.query(tempQuery, [eventsData.eventId]);
                        console.log(`for event ${eventsData.eventId},Row count of deleted(Soft) venues are: ${result.rowCount}`);
                    }
                    // To delete venue logic ends here//

                    let venueMapIds = []
                    for (let venue of eventsData.venues) {// to iterate venues
                        let result = await client.query(queries.insertVenueEventMapping, [eventsData.eventId, venue]);
                        if (result.rows[0])
                            venueMapIds.push(result.rows[0].event_venue_id)
                    }// for
                    console.log(`Event ${eventsData.eventId}, new event_venue_ids are  : ${JSON.stringify(venueMapIds)}`);
                }// if
                break;
            }
            case "event_proctor_assignment": {
                if (eventsData.venueProctorAssignment) {
                    let eventVenueIds = [];
                    for (let assignment of eventsData.venueProctorAssignment) {
                        let result = await client.query(queries.updateVenueProctorMapping,
                            [assignment.proctorId, eventsData.eventId, assignment.eventVenueMapId]);

                        if (result.rows) {
                            eventVenueIds.push(result.rows[0].event_venue_id)
                        }
                    }
                    console.log(`Event ${eventsData.eventId}, updated for proctor assignment, Updated event_venue_ids are  : ${JSON.stringify(eventVenueIds)}`);
                }
                break;
            }
            case "event_judge_assignment": {
                if (eventsData.judgeAssignment) {

                    // Logic to delete regions and judges mapping if user removed it from UI

                    /*                        for(let assignment of eventsData.judgeAssignment){
                                                   if(assignment.regions){
                                                        let regionIdArr = []; 
                                                        assignment.regions.forEach(item => {if(item.regionId) regionIdArr.push(item.regionId)});   
                                                    //for(let region of assignment.regions)
                                                   }     
                                            }
                    */
                    let delRegionStaffMap = await client.query(queries.deleteStaffRegionMapping,
                        [true, loggedInUser, new Date().toUTCString(), eventsData.eventId]);

                    console.log(`Event ${eventsData.eventId}, Staff region-mapping deletion row count is : ${delRegionStaffMap.rowCount}`)

                    let delStaffCatMap = await client.query(queries.deleteStaffCatMapping,
                        [true, loggedInUser, new Date().toUTCString(), eventsData.eventId]);

                    console.log(`Event ${eventsData.eventId}, Staff cat-mapping deletion row count is : ${delStaffCatMap.rowCount}`)

                    //Logic ends here

                    for (let assignment of eventsData.judgeAssignment) {
                        let regionMapIds = [];
                        if (assignment.regions) {
                            for (let region of assignment.regions) {
                                //console.log(`region for regionId ${ region.regionId}`)
                                let regionStaffRes = await client.query(queries.insertRegionStaffMapping,
                                    [eventsData.eventId, assignment.catId, assignment.catMapId,
                                    region.regionId, loggedInUser, new Date().toUTCString()]);
                                if (regionStaffRes.rowCount != 0)
                                    regionMapIds.push(regionStaffRes.rows[0].event_region_staff_map_id);
                                //console.log("insertRegionStaffMapping =>", eventsData.eventId, assignment.catId, assignment.catMapId,region.regionId, loggedInUser, new Date().toUTCString());
                                if (region.judges) {
                                    let staffMapIds = [];
                                    for (let judge of region.judges) {
                                        if (regionStaffRes.rowCount != 0) {
                                            let catStaffMapRes = await client.query(queries.insertCatStaffMapId,
                                                [eventsData.eventId, assignment.catMapId, parseInt(judge + ""),
                                                    'Judge', loggedInUser, new Date().toUTCString(),
                                                regionStaffRes.rows[0].event_region_staff_map_id]);
                                            // console.log( "insertCatStaffMapId =>", eventsData.eventId, assignment.catMapId, judge,'Judge', loggedInUser, new Date().toUTCString())
                                            if (catStaffMapRes.rowCount != 0)
                                                staffMapIds.push(catStaffMapRes.rows[0].event_cat_staff_map_id)
                                        }
                                    }
                                    console.log(`Event ${eventsData.eventId}, for region ${region.regionId}, and for category ${assignment.catId} event_cat_staff_map_ids are -> ${JSON.stringify(staffMapIds)}`)
                                }
                            }
                            console.log(`Event ${eventsData.eventId}, for category ${assignment.catId} event_region_staff_map_ids are -> ${JSON.stringify(regionMapIds)}`)
                        }
                    }
                }
                break;
            }
            case "event_questionnaires": {
                if (eventsData.questionnaire) {
                    //Delete question if they are not coming from UI logic starts here
                    let queIds = []
                    eventsData.questionnaire.forEach((item) => { if (item.questionId) queIds.push(item.questionId) });
                    if (queIds.length > 0) {
                        let tempQuery = queries.deleteDefinedQuestions.replace('$5', queIds.join(','))
                        let result = await client.query(tempQuery,
                            [true, loggedInUser, new Date().toUTCString(), eventsData.eventId]);
                        console.log(`for event ${eventsData.eventId}, Row count of deleted(Soft) questionnaire mappings are: ${result.rowCount}`);
                    }
                    //logic ends here
                    let questionIds = [];
                    let questionUpdatedIds = [];
                    for (let question of eventsData.questionnaire) {
                        if (question.questionId) {
                            let result = await client.query(queries.updateQueStmtAndResType,
                                [question.question, question.answerType[0], loggedInUser,
                                new Date().toUTCString(), eventsData.eventId, question.questionId]);
                            if (result.rowCount > 0)
                                questionUpdatedIds.push(question.questionId);
                        } else {
                            let result = await client.query(queries.insertQuestionnaire,
                                [eventsData.eventId, question.question, question.answerType[0], loggedInUser, new Date().toUTCString()]);
                            if (result.rowCount != 0)
                                questionIds.push(result.rows[0].question_id);
                        }
                    }
                    console.log(`Event ${eventsData.eventId},updated questions question_ids are : ${JSON.stringify(questionUpdatedIds)}`)
                    console.log(`Event ${eventsData.eventId}, newly created question_ids are : ${JSON.stringify(questionIds)}`);
                }
                break;
            }
            case "event_evaluator_assignment": {
                if (eventsData.evaluatorAssignment) {

                    if(eventsData.evaluatorAssignment.length == 0){
                        await client.query(queries.deleteAllEvaluatorsForEvalSection,
                            [true, loggedInUser, new Date().toUTCString(), eventsData.eventId]); 
                    }

                    let selEvalIds = [];
                    eventsData.evaluatorAssignment.forEach((item) => {if(item.evalId) selEvalIds.push(item.evalId)});
                    if(selEvalIds.length > 0){
                        
                        let tempQuery = queries.deleteEvaluatorsForEvalSection.replace('$5', selEvalIds.join(','))
                        let result = await client.query(tempQuery,
                            [true, loggedInUser, new Date().toUTCString(), eventsData.eventId]);
                        console.log(`for event ${eventsData.eventId}, Row count of deleted(Soft) evaluator mappings are: ${result.rowCount}`);
                    }

                    evantEvalIds =[];
                    for (let eval of eventsData.evaluatorAssignment) {
                        let result = await client.query(queries.insertEventEvaluator,
                            [eventsData.eventId, eval.evalId, loggedInUser, new Date().toUTCString()]);
                       if(result.rowCount > 0)
                            evantEvalIds.push(result.rows[0].event_evaluator_id)
                    }
                    console.log(`Event ${eventsData.eventId}, Newly inserted event_evaluator_ids are: ${JSON.stringify(evantEvalIds)}`)
                }
                break;
            }
        }// Switch

        //if request from next section data in same requst
        if (eventsData.nextSectionCode) {
            switch (eventsData.nextSectionCode) {
                case "event_categories": {
                    response.event_categories = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_categories", eventsData.eventType, client);
                    break;
                }
                case "event_groups": {
                    response.event_groups = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_groups", "", client);
                    break;
                }
                case "event_cat_group_map": {
                    response.eventCatGroupMap = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_cat_group_map", "", client);
                    break;
                }
                case "event_venue_assignment": {
                    response.event_venue_assignment = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_venue_assignment", "", client);
                    break;
                }
                case "event_proctor_assignment": {
                    response.event_proctor_assignment = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_proctor_assignment", eventsData.eventType, client);
                    break;
                }
                case "event_judge_assignment": {
                    response.event_judge_assignment = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_judge_assignment", eventsData.eventType, client);
                    break;
                }
                case "event_questionnaires": {
                    response.event_questionnaires = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_questionnaires", eventsData.eventType, client);
                    break;
                }
                case "event_evaluator_assignment": {
                    response.event_evaluator_assignment = await getSectionWiseData(loggedInUser, eventsData.eventId, "event_evaluator_assignment", eventsData.eventType, client);
                    break;
                }
            }//switch
        }//if  


        client.query("commit;");
        response.status = "success";
        return ({
            data: response
        })
    }
    catch (error) {
        await client.query("ROLLBACK;");
        console.error(`eventReqOperations.js::insertevents() Rollback called since there is an error as: ${error}`);
        return (errorHandling.handleDBError('transactionError'));
    } finally {
        client.release();
    }
}

async function validateAndDeleteMappings(client, eventData) {
    console.log('validateAndDeleteMappings called.')
    switch (eventData.sectionCode) {

        case "event_categories": {

            let listOfCatIds = []
            eventData.categories.forEach((item) => { if (item.catId) listOfCatIds.push(item.catId) });
            if (listOfCatIds.length <= 0)
                return { isError: false }

            // validations if category has mapped to grade   
            let tempQuery = queries.checkIsCategoryAllowedToDelete.replace('$2', listOfCatIds.join(','))
            let result1 = await client.query(tempQuery, [eventData.eventId]);
            //validation if category has been mapped to staff(Judge)
            tempQuery = queries.checkIsCategoryMappedToStaff.replace('$2', listOfCatIds.join(','))
            let result2 = await client.query(tempQuery, [eventData.eventId]);
            console.log("validating selected categories : " + listOfCatIds.join(','))
            console.log(`[Validation] : are unselected categories mapped to group? ${!result1.rows[0].allowed_to_delete}`);
            console.log(`[Validation] : are unselected categories mapped to staff(Judge)? ${!result2.rows[0].allowed_to_delete}`);

            if (result1.rows[0].allowed_to_delete === false) {
                return {
                    isError: true,
                    error: errorHandling.handleDBError('cat_grp_map_error')
                }
            } else if (result2.rows[0].allowed_to_delete === false) {
                return {
                    isError: true,
                    error: errorHandling.handleDBError('cat_staff_map_error')
                }
            } else if (
                result1.rows[0].allowed_to_delete === true &&
                result2.rows[0].allowed_to_delete === true
            ) {

                tempQuery = queries.deleteCategoryMapping.replace('$2', listOfCatIds.join(','))
                result = await client.query(tempQuery, [eventData.eventId]);
                console.log(`for event ${eventData.eventId}, row deleted for categories: ${result.rowCount}`);
            }
            return { isError: false }
        }
    }

}



async function getSectionWiseData(loggedInUser, eventId, sectionCode, eventType, client) {

    console.log(`getSectionWiseData : ${sectionCode} and eventId ${eventId}`)
    switch (sectionCode) {
        case "event_categories": {
            let result = await client.query(queries.getSelecedAndAllCats, [eventId, eventType]);
            return result.rows[0].event_cats;
        }
        case "event_groups": {
            let result = await client.query(queries.getSelectedAndAllGroups, [eventId]);
            return result.rows[0].selected_and_all_grades;
        }
        case "event_cat_group_map": {
            let groupData = await client.query(queries.getEventGroupMapping, [eventId]);
            let catData = await client.query(queries.getEventCatMapping, [eventId]);
            let mappedData = await client.query(queries.getSelCatsCGmapSection, [eventId]);
            let catMapRespJson = catData.rows[0].cat_mapping;
            for (let i = 0; i < catMapRespJson.length; i++) {
                for (let grpMapRow of mappedData.rows) {
                    if (catMapRespJson[i].catId == grpMapRow.event_category_id) {
                        //  console.log(`cat-catId : ${catMapRespJson[i].catId} ----  grpMap-catId : ${grpMapRow.event_category_id}`)
                        if (catMapRespJson[i].mappedGroups === undefined) {
                            catMapRespJson[i].mappedGroups = [];
                        }
                        catMapRespJson[i].mappedGroups.push({
                            "gradeGroupId": grpMapRow.grade_group_id,
                            "gradeGroupName": grpMapRow.group_name,
                            "gradeGroupMapId": grpMapRow.event_grade_group_map_id
                        });
                    }
                }
            }

            return {
                gradeGroupMapping: groupData.rows[0].group_mapping,
                categoryMapping: catMapRespJson
            }

        }
        case "event_venue_assignment": {

            let result = await client.query(queries.getVenusAllDetailsByEventLevel, [eventId]);
            return result.rows[0].venue_list;
        }
        case "event_proctor_assignment": {

            let proctorList = await client.query(queries.getProctorsByEventId, [eventId, `%${eventType}%proctor%`]);
            let venueList = await client.query(queries.getVenusNameAndIsByEventLevel, [eventId]);
            return {
                proctorList: proctorList.rows[0].proctor_data,
                venueList: venueList.rows[0].venue_list
            }
        }
        case "event_judge_assignment": {
            let regionsList = await client.query(queries.getRegionsByEventId, [eventId]);
            // let JudgesList = await client.query(queries.getJudgesByEventsRegion, [eventId, `%judge%`]);
            let categoriesList = await client.query(queries.getEventCatMapping, [eventId]);

            let judgeMapping = await client.query(queries.getJudgeMapForAssSec, [eventId]);

            let respObj = [];
            if (judgeMapping.rowCount > 0) {
                for (let row of judgeMapping.rows) {
                    let index = respObj.findIndex((item) => item.catId == row.cat_id);
                    if (index < 0) {
                        let tempJObj = {
                            catId: row.cat_id,
                            categoryName: row.cat_name,
                            catMapId: row.cat_map_id,
                            regionsJudgesArray: [
                                {
                                    regions: [
                                        {
                                            regionId: row.org_id,
                                            regionName: row.region_name
                                        }
                                    ],
                                    judges: [
                                        {
                                            judgeId: row.user_id,
                                            judgeName: row.judge_name
                                        }
                                    ]
                                }
                            ]
                        }
                        respObj.push(tempJObj)
                    } else {
                        let regIndex = respObj[index].regionsJudgesArray.findIndex(item => item.regions[0].regionId == row.org_id)
                        if (regIndex < 0) {

                            respObj[index].regionsJudgesArray.push(
                                {
                                    regions: [
                                        {
                                            regionId: row.org_id,
                                            regionName: row.region_name
                                        }
                                    ],
                                    judges: [
                                        {
                                            judgeId: row.user_id,
                                            judgeName: row.judge_name
                                        }
                                    ]
                                }
                            )

                        } else {
                            respObj[index].regionsJudgesArray[regIndex]
                                .judges.push({
                                    judgeId: row.user_id,
                                    judgeName: row.judge_name
                                })
                        }
                    }
                }
            }

            return {
                regionsList: regionsList.rows[0].region_array,
                categories: respObj,
                categoriesList: categoriesList.rows[0].cat_mapping
            }
        }
        case "event_questionnaires": {
            let questionTypeList = await client.query(queries.getQuestionTypesFromLookup);
            let tempArr = []
            if (questionTypeList.rowCount > 0) {
                for (let row of questionTypeList.rows) {
                    tempArr.push(row.code)
                }
            } else
                console.error("Of type \'Question Type\' not found in t_lookup table");

            let definedQueArr = [];
            let definedQueRes = await client.query(queries.getDefinedQuestionnaire, [eventId]);
            if (definedQueRes.rowCount > 0) {
                for (let row of definedQueRes.rows) {
                    definedQueArr.push({
                        "question": row.question,
                        "questionId": row.question_id,
                        "answerType": [
                            row.answer_type
                        ]
                    });
                }
            }

            return {
                "answerTypes": tempArr,
                "questionnaire": definedQueArr
            }
        }
        case "event_evaluator_assignment": {
            let evaluatorsList = await client.query(queries.getSelectedAndAllEvaluators, [eventId, `%Diocesan%${eventType}%Evaluator%`]);
            return evaluatorsList.rowCount > 0 ? evaluatorsList.rows[0].evaluators : [];
        }
    }
}

async function getRegionWiseJudges(loggedInUser, regionId) {

    let client = await dbConnections.getConnection();
    try {
        let judgesList = await client.query(queries.getJudgesByEventRegion, [regionId, '%Judge%']);

        return ({
            data: {
                status: 'success',
                judges: judgesList.rows == null ? [] : judgesList.rows[0].judge_list
            }
        })

    } catch (error) {
        console.error(`eventReqOperations.js::insertevents() Rollback called since there is an error as: ${error}`);
        return (errorHandling.handleDBError('transactionError'));
    } finally {
        client.release();
    }

}

async function getRegionAndParish() {

    let client = await dbConnections.getConnection();

    try {
        let metadata = {};
        let regions = [];

        let getRegionAndParish = `select to3.org_id region_id, to3.name region_name, to2.org_id parish_id, to2.name parish_name  
            from t_organization to2, t_organization to3 
            where to2.org_type = 'Parish'
            and to3.org_id = to2.parent_org_id 
            order by region_id, parish_name;`
        let res = await client.query(getRegionAndParish);
        if (res && res.rowCount > 0) {
            regionId = null;
            parishes = [];
            region = {};
            for (let row of res.rows) {



                if (regionId != row.region_id) {

                    console.log("row.region_id", row.region_id);



                    if (regionId != null) {
                        console.log("regionId", regionId);

                        region.parishes = parishes;
                        regions.push(region);
                    }

                    region = {};
                    //parishs = {};
                    parishes = [];

                    region.regionName = row.region_name;
                    region.regionId = row.region_id;
                    regionId = row.region_id;
                    console.log("regions", regions);
                }

                parish = {};
                parish.parishId = row.parish_id;
                parish.parishName = row.parish_name;
                parishes.push(parish);
            }

            region.parishes = parishes;
            regions.push(region);

        }

        metadata.regions = regions;

        return ({
            data: {
                status: 'success',
                metaData: metadata
            }
        })

    } catch (error) {
        console.error(`reqOperations.js::getProctorData() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }
}

async function getEventType() {

    let client = await dbConnections.getConnection();
    try {
        let metadata = {};
        let eventType = [];

        let getEventType = `select tet.name event_type, tet.is_venue_required, tet.is_proctor_required, tet.is_judge_required, 
        tec.event_category_id, tec.name event_category_name, tec.school_grade_from, tec.school_grade_to , tet.is_school_grade_required
        from t_event_type tet , t_event_category tec 
        where tet.is_deleted = false 
        and tec.event_type_id = tet.event_type_id order by tet.name;`
        let res = await client.query(getEventType);

        if (res && res.rowCount > 0) {
            type = null;
            eventName = [];
            eventTypes = {};

            for (let row of res.rows) {

                if (type != row.event_type) {

                    if (type != null) {
                        eventTypes.eventName = eventName;
                        eventType.push(eventTypes);

                    }
                    eventTypes = {};
                    eventName = [];
                    eventTypes.eventType = row.event_type;
                    eventTypes.isVenueRequired = row.is_venue_required;
                    eventTypes.isProctorRequired = row.is_proctor_required;
                    eventTypes.isJudgeRequired = row.is_judge_required;
                    eventTypes.isSchoolGradeRequired = row.is_school_grade_required;
                    type = row.event_type;

                }

                eventNames = {};
                eventNames.id = row.event_category_id;
                eventNames.name = row.event_category_name;
                eventNames.description = row.description;
                eventNames.schoolGradeFrom = row.school_grade_from;
                eventNames.schoolGradeTo = row.school_grade_to;
                eventName.push(eventNames);
            }
            eventTypes.eventName = eventName;
            eventType.push(eventTypes);
        }

        metadata.eventType = eventType;

        return ({
            data: {
                status: 'success',
                metaData: metadata
            }
        })

    } catch (error) {
        console.error(`reqOperations.js::getEventType() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }
}

async function getProctorData(userData) {

    let client = await dbConnections.getConnection();
    try {
        let metadata = {};
        console.log("userData", JSON.stringify(userData));
        let rolesData = [];

        var roles = "'" + userData.rolesData.join("','") + "'";

        let getProctorData = `select distinct user_id, concat(first_name ,' ', last_name) as name 
        from v_user 
        where role_name  in (${roles});`

        let res = await client.query(getProctorData);
        if (res && res.rowCount > 0) {

            let proctorData = [];
            for (let row of res.rows) {
                let proctor = {};
                proctor.userId = row.user_id;
                proctor.name = row.name;
                proctorData.push(proctor);
            }
            metadata.proctorData = proctorData;
        }

        return ({
            data: {
                status: 'success',
                metaData: metadata
            }
        })

    } catch (error) {
        console.error(`reqOperations.js::getProctorData() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }
}

async function getEventQuestionnaireData() {
    let client = await dbConnections.getConnection();
    try {
        let metadata = {};
        let getEventQuestionnaireData = `select * from t_event_questionnaire`;
        let res = await client.query(getEventQuestionnaireData);
        if (res && res.rowCount > 0) {
            console.log("In Question response : " + res);
            let questionData = [];
            for (let row of res.rows) {
                let questions = {};
                questions.questionId = row.question_id;
                questions.eventId = row.event_id;
                questions.question = row.question;
                questions.answerType = row.answer_type;
                questionData.push(questions);
            }
            metadata.questionData = questionData;
        }
        return ({
            data: {
                status: 'success',
                metaData: metadata
            }
        })

    } catch (error) {
        console.log(`reqOperations.js::getEventQuestionnaireData() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }
}
/*............get all Events from db for registration purpose........*/
async function getEventForRegistration() {
    let client = await dbConnections.getConnection();
    try {
        let metadata = {};
        let getEventForRegistration = `select distinct  event_id, event_name, event_type, event_desciption, event_start_date, event_end_date, registration_start_date, registration_end_date
                                        from v_event ve
                                        where
                                        ve.event_id not in (select event_id 
                                                                from t_event_participant_registration tepr 
                                                                where tepr.user_id = 1223
                                                            )
                                        and  ve.registration_start_date <= current_date
                                        and  ve.registration_end_date >= current_date
                                        and  ve.is_deleted = false;`;
        let res = await client.query(getEventForRegistration);
        if (res && res.rowCount > 0) {
            console.log("In Event response : " + res);
            let eventData = [];
            for (let row of res.rows) {
                let events = {};
                events.event_Id = row.event_id;
                events.name = row.event_name;
                events.event_type = row.event_type;
                events.description = row.event_desciption;
                events.startDate = row.event_start_date;
                events.endDate = row.event_end_date;
                events.registrationStartDate = row.registration_start_date;
                events.registrationEndDate = row.registration_end_date;
                events.orgId = row.org_id;
                eventData.push(events);
            }
            metadata.eventData = eventData;
        }
        return ({
            data: {
                status: 'success',
                metaData: metadata

            }
        })

    } catch (error) {
        console.log(`reqOperations.js::getEventForRegistration() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }

}




module.exports = {
    updateEvent,
    getVenues,
    getProctorData,
    insertEvents,
    getRegionAndParish,
    getProctorData,
    getEventType,
    getEventQuestionnaireData,
    getEventForRegistration,
    deleteEvents,
    getRegionWiseJudges
}
