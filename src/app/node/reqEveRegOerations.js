const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);
const queries = require('./static/reqEveRegOerations_queries');



async function getEventDef(eventId, loggedInUserId) {

    if (!eventId || !loggedInUserId) throw "getEventDef::invalid query parameters recived in request.";
    let client = await dbConnections.getConnection();
    try {
        let response = {};
        let result = await client.query(queries.getEventData, [eventId, loggedInUserId]);
        console.log('Rows recived...' + result.rowCount)
        if (result.rowCount > 0) {
            for (let row of result.rows) {
                if (response.eventId == undefined) {
                    response.name = row.event_name;
                    response.eventId = row.event_id;
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
                            answerType: row.answer_type
                        })
                    }

                } else {

                    let catIndex = response.categories.findIndex((item) => item.catMapId == row.event_cat_map_id);
                    if (catIndex === -1 && row.catId != null )
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
                            answerType: row.answer_type
                        })

                }
            }
        }

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

module.exports = {
    getEventDef
}