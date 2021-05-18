const { Client, Pool } = require('pg');
const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);


var connCloseFlag = false;
async function persistParticipantScore(userScoreData, userId) {

    let client = await dbConnections.getConnection(); 
    
    try {
        
        if(userScoreData.action === 'save' || userScoreData.action === 'submit')
            console.log('Judge\'s  {' + userId + ')action is : ' + userScoreData.action + ' no. of participant\'s score to update : ' + userScoreData.scoreData.length)
        else if(userScoreData.action === 'approve')
            console.log('Event co-ordinator ('+ userId +') to approve score.')

        await client.query('begin;');
        //Populating user t_participant_event_score;
     
       
       // Score upload save button logic.
        if (userScoreData.action === 'save') {
            const instScrQry = `INSERT INTO t_participant_event_score
                                (participant_event_reg_cat_id, event_cat_staff_map_id, score, created_by, is_deleted, created_date )
                            VALUES($1, $2, $3, $4, $5, $6) returning participant_event_score_id; `;

            const updateScrQry = `update t_participant_event_score set score=$1, updated_by=$2, updated_date=$3
                                  where participant_event_score_id=$4`;

            for (let i = 0; i < userScoreData.scoreData.length; i++) {

                let paricipant = userScoreData.scoreData[i];
                if (paricipant.scoreRefId == null) {
                    console.log('scoreRefId is null so insterting the record.')
                    let instScrQryValue = [
                        paricipant.partEveRegCatId,
                        paricipant.catStaffMapId,
                        paricipant.score,
                        userId,
                        false,
                        new Date().toUTCString()
                    ];
                    await client.query(instScrQry, instScrQryValue)
                } else {
                    console.log('scoreRefId is ' + paricipant.scoreRefId + ' so updating the record.')
                    let updateScrQryValue = [
                        paricipant.score,
                        userId,
                        new Date().toUTCString(),
                        paricipant.scoreRefId
                    ];
                    await client.query(updateScrQry, updateScrQryValue) 
                }
            }
            await client.query(`commit;`);
            connCloseFlag = true;
        }

     //score upload submit button logic   
        if (userScoreData.action === 'submit') {
                 
            let updateSubmittedStatus = `update t_event_cat_staff_map set is_score_submitted = true
                                          where event_id = ${userScoreData.eventId} and user_id= ${userId};`;

             await client.query(updateSubmittedStatus);
            console.log(`Updated is_score_submitted for event id: ${userScoreData.eventId}`)
            userScoreData.action = 'save';
            console.log('Calling same function(persistParticipantScore) to save all \'Submit\' action data.');
            persistParticipantScore(userScoreData, userId)
            client.query(`commit;`);
        }

        // when event co-ordinator approves the score, Approve button logic. 
        if (userScoreData.action === 'approve'){

            let query = ` update t_event_cat_staff_map set is_score_approved = true 
                                where event_id = ${userScoreData.eventId} 
                                and user_id = ${userScoreData.judgeId}	
                                and event_category_map_id in (
                                                        select event_cat_map_id  from t_event_category_map 
                                                                                where event_category_id = ${userScoreData.catId} 
                                                                                and event_id = ${userScoreData.eventId});` 
            await client.query(query);
            console.log(`User ${userId} approved score for category: ${userScoreData.catId}, Judge: ${userScoreData.judgeId}, Event: ${userScoreData.eventId}`);
            
            // Check whether to calculate overall score or not
           await calculateScore(client, userScoreData.eventId, userScoreData.catMapId)
                    .catch((error) => {
                        throw error;
                    });

            client.query(`commit;`);
        }

        return {
            data: {
                status: 'success'
            }
        }

    } catch (error) {
        
        await client.query('rollback;');
        connCloseFlag = true;
        dbConnections.endConnection(client);
        console.error(`reqScoreOperations.js::persistParticipantScore() : ${error}`);
        return (errorHandling.handleDBError('connectionError'));

    } finally {
        if (connCloseFlag) {
                client.release(false);
            connCloseFlag = false;
        }
    }

}

async function calculateScore(client, eventId, eventCategoryMapId) {

    console.log('calculateScore called :: eventId ==> ' + eventId + '  eventCategoryMapId => ' + eventCategoryMapId);
 
//    try {

      //  await client.query('begin;');

        // First check if the score for all the judges is approved 
        let approvedCountQuery = `with approved as (select tecm.event_cat_map_id , count(tecsm.event_cat_staff_map_id) approved
                                    from t_event_category_map tecm, t_event_cat_staff_map tecsm
                                    where tecsm.event_id = tecm.event_id 
                                    and tecsm.event_category_map_id = tecm.event_cat_map_id 
                                    and tecsm.is_score_approved = true
                                    group by tecm.event_cat_map_id
                                    )	,
                                    total_judges as (select tecm.event_cat_map_id , count(tecsm.event_cat_staff_map_id) total
                                    from t_event_category_map tecm, t_event_cat_staff_map tecsm
                                    where tecsm.event_id = tecm.event_id 
                                    and tecsm.event_category_map_id = tecm.event_cat_map_id 
                                    and tecsm.role_type = 'Judge'	
                                    group by tecm.event_cat_map_id
                                    )
                                    select tecm.event_id, tecm.event_cat_map_id, approved.approved approved_count , total_judges.total total_judges_count
                                    from t_event_category_map tecm 
                                    left join approved  on approved.event_cat_map_id = tecm.event_cat_map_id 
                                    left join total_judges on total_judges.event_cat_map_id = tecm.event_cat_map_id 
                                    where tecm.event_id = ${eventId} and tecm.event_cat_map_id = ${eventCategoryMapId};`
        
        let result = await client.query(approvedCountQuery);

        console.info('approvedCountQuery result == > ', result.rowCount)

        if (result && result.rowCount > 0) {
            console.info("Query result ==>", result.rows[0].approved_count, result.rows[0].total_judges_count);
            if( result.rows[0].approved_count = result.rows[0].total_judges_count){

                console.info('Score is approved for the category. Insert overall score');

                //Get the average score for each student
                let insertScore = `insert into t_participant_event_overall_score (
                                        event_category_map_id,
                                        event_participant_registration_id,
                                        participant_event_reg_cat_id,
                                        overall_score
                                    ) 
                                    with approved as (select tecm.event_cat_map_id , count(tecsm.event_cat_staff_map_id) approved
                                    from t_event_category_map tecm, t_event_cat_staff_map tecsm
                                    where tecsm.event_id = tecm.event_id 
                                    and tecsm.event_category_map_id = tecm.event_cat_map_id 
                                    and tecsm.is_score_approved = true
                                    group by tecm.event_cat_map_id
                                )	,
                                total_score as (select tperc.event_participant_registration_id, tecsm.event_category_map_id event_cat_map_id, 
                                tperc.participant_event_reg_cat_id , sum(tpes.score) total
                                    from t_participant_event_score tpes, t_event_cat_staff_map tecsm, t_participant_event_reg_cat tperc,
                                        t_event_participant_registration tepr 
                                    where  tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id 
                                    and tecsm.role_type = 'Judge'
                                    and tperc.participant_event_reg_cat_id = tpes.participant_event_reg_cat_id 
                                    and tepr.event_participant_registration_id = tperc.event_participant_registration_id 
                                    group by tperc.event_participant_registration_id, tecsm.event_category_map_id,tperc.participant_event_reg_cat_id 
                                )
                                    select tecm.event_cat_map_id,total_score.event_participant_registration_id, total_score.participant_event_reg_cat_id,
                                            (total_score.total/approved.approved) overall_score
                                    from t_event_category_map tecm 
                                    join approved  on approved.event_cat_map_id = tecm.event_cat_map_id 
                                    join total_score on total_score.event_cat_map_id = approved.event_cat_map_id 
                                where tecm.event_id = ${eventId} and tecm.event_cat_map_id = ${eventCategoryMapId};`;

                let result = await client.query(insertScore);

                console.info("Inserted record count :: ", result.rowCount)
            }
        }

    //    return client;

  //  } catch (error) {
       // await client.query('rollback;');
    //   throw error;
    //} 
 
}


async function getScoreByCategory(eventId, eventCategoryId) {

    console.log('getScoreByCategory called, Event Id = ' + eventId + ', Category Id = '+ eventCategoryId);


    let scores = [];

    let client = await dbConnections.getConnection();

    try {

        /********************** scores *******************************************************************************************/
            const eventQuery = `select distinct  tecm.event_category_id
                                    , tepr.enrollment_id
                                    , tecsm.user_id staff_id
                                    , tu.first_name , tu.last_name 
                                    , tpes.score 
                                    ,concat(tu2.title,'.',' ',tu2.first_name,' ', tu2.middle_name, ' ',tu2.last_name) participant_name
                                    ,to2."name" parish_name
                                from t_event_category_map tecm 
                                join t_event_cat_staff_map tecsm on tecsm.event_id = tecm.event_id and tecsm.event_category_map_id = tecm.event_cat_map_id 
                                join t_event_participant_registration tepr on tepr.event_id = tecm.event_id 
                                join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id and tperc.event_category_id = tecm.event_category_id 
                                join t_participant_event_score tpes on tpes.participant_event_reg_cat_id = tperc.participant_event_reg_cat_id and tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id 
                                join t_user tu on tu.user_id = tecsm.user_id
                                join t_user tu2 on tepr.user_id = tu2.user_id
                                join t_organization to2 on to2.org_id = tu2.org_id 
                                where tecm.event_id = ${eventId} and tecm.event_category_id = ${eventCategoryId} order by 1,2,3 ;`

        let result = await client.query(eventQuery);

        if (result && result.rowCount > 0) {

            let enrollmentId = 0;
            let score = {};

            for (let row of result.rows) {


                // Get categories
                if (enrollmentId == 0) {
                    enrollmentId = row.enrollment_id;

                } else if (row.enrollment_id != enrollmentId) {
                    enrollmentId = row.enrollment_id;

                    if (_.findWhere(scores, score) == null) {
                        scores.push(score);
                    }

                    score = {};
                }

                score.enrollmentId = enrollmentId;
                score[row.staff_id] = row.score;
                score.participantName = row.participant_name
                score.org = row.parish_name


            } // End of for loop

            //console.log("8");
            if (_.findWhere(scores, score) == null) {
                scores.push(score);
            }

            console.log(`Stringified JSON is : ` + JSON.stringify(scores))

        }

        return ({
            data: {
                status: 'success',
                scoreData: scores
            }
        })

    } catch (err) {
        console.error(`reqOperations.js::getScoreByCategory() inner try block --> error : ${err}`)
        console.log("Transaction ROLLBACK called");
        return (errorHandling.handleDBError('transactionError'));
    } finally {
        client.release(false);
    }
}


module.exports = {
    persistParticipantScore,
    getScoreByCategory
}