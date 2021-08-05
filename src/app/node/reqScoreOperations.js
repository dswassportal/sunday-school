const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);

async function persistParticipantScore(userScoreData, loggedInUser) {

    let client = await dbConnections.getConnection();

    try {

        for (let score of userScoreData.scoreArr) {

            console.log('Updating score for event :' + score.eventId + ' by user ' + score.judge)

            await client.query('begin;');

            // First create the temp table
            let tempTable = `create temporary table t_temp_score(
                                enrollment_id varchar,
                                event_category_name varchar,
                                score int
                              );`;

            let insertIntoTempTable = `INSERT INTO t_temp_score (enrollment_id, event_category_name, score)
                              SELECT enrollmentid, category, score 
                              FROM jsonb_to_recordset($1::jsonb) AS t (enrollmentid text, category text, score int)`;

            await client.query(tempTable);

            let result = await client.query(insertIntoTempTable, [JSON.stringify(score.scoreData)]);

            let tRes = await client.query('select * from t_temp_score');
            console.log(` enrollment_id \t|\t event_category_name \t\t\t|\t\t score`)
            for (let row of tRes.rows) {
                console.log(` ${row.enrollment_id} \t|\t ${row.event_category_name} \t\t\t|\t\t ${row.score}`)
            }
            let deleteFromScoreTable = '';
            let insertIntoScoreTable = '';
            console.log('Data inserted into temp table', result.rowCount);
            let getEventType = `select event_type from t_event te where event_id = $1`;
            let EveTypeResult = await client.query(getEventType, [score.eventId]);

            if (EveTypeResult.rows[0].event_type === 'Sunday School Final Exam' || EveTypeResult.rows[0].event_type === 'Sunday School Midterm Exam') {


                deleteFromScoreTable = `delete from t_participant_event_score where participant_event_score_id in(	
                                            select 
                                                    tpes.participant_event_score_id 
                                            from t_event_cat_staff_map tecsm
                                                join  t_event_participant_registration tepr on tecsm.event_id = tepr.event_id 
                                                    and tecsm.event_id = ${score.eventId} and tecsm.user_id = ${score.judge} and tecsm.is_deleted = false
                                            left join t_participant_event_score tpes on tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id
                                                and tpes.is_deleted = false
                                            join t_event_category_map tecm on tecm.event_id = tepr.event_id 
                                            join t_event_category tec on tec.event_category_id = tecm.event_category_id 
                                            join t_organization to2 on to2.org_id = tecsm.role_id
                                            join t_student_sundayschool_dtl tssd on tssd.school_grade = to2."name"
                                            and tepr.user_id = tssd.student_id)`;


                insertIntoScoreTable = `  insert into t_participant_event_score (participant_event_reg_cat_id, event_cat_staff_map_id, score, created_by, created_date)
                                                select tecm.event_cat_map_id , tecsm.event_cat_staff_map_id, tts.score, ${loggedInUser}, current_timestamp 
                                                            from t_temp_score tts join t_event_category tec on tec."name" = tts.event_category_name
                                                    left join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                                                    and tecm.event_id = ${score.eventId}
                                                    join t_event_participant_registration tepr on tts.enrollment_id  = tepr.enrollment_id 
                                                        and tepr.registration_status = 'Registered'
                                                    left join t_event_cat_staff_map tecsm on  tecsm.event_category_map_id = tecm.event_cat_map_id 
                                                    and tecsm.user_id = ${score.judge} and tecsm.is_deleted = false`
            } else {

                // Delete existing records if any
                deleteFromScoreTable = `delete from t_participant_event_score where participant_event_score_id in (
                                        select tpes.participant_event_score_id  from t_temp_score tts join t_event_category tec on tec."name" = tts.event_category_name
                                                    join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                                                    and tecm.event_id = ${score.eventId} 
                                                    join t_event_participant_registration tepr on tts.enrollment_id  = tepr.enrollment_id 
                                                    join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id
                                                        and tperc.event_category_id = tecm.event_cat_map_id 
                                                    join t_event_cat_staff_map tecsm on  tecsm.event_category_map_id = tecm.event_cat_map_id 
                                                        and tecsm.user_id = ${score.judge} 
                                                    join t_participant_event_score tpes on tpes.participant_event_reg_cat_id  = tperc.participant_event_reg_cat_id 
                                                        and  tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id);`;


                insertIntoScoreTable = `insert into t_participant_event_score (participant_event_reg_cat_id, event_cat_staff_map_id, score, created_by, created_date)
                                            select tperc.participant_event_reg_cat_id, tecsm.event_cat_staff_map_id, tts.score, ${loggedInUser}, current_timestamp  from t_temp_score tts join t_event_category tec on tec."name" = tts.event_category_name
                                            join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                                            and tecm.event_id = ${score.eventId} 
                                            join t_event_participant_registration tepr on tts.enrollment_id  = tepr.enrollment_id 
                                        join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id
                                            and tperc.event_category_id = tecm.event_cat_map_id 
                                        join t_event_cat_staff_map tecsm on  tecsm.event_category_map_id = tecm.event_cat_map_id 
                                            and tecsm.user_id = ${score.judge}`;

            }
            let deleteResult = await client.query(deleteFromScoreTable);

            console.log('No. of rows deleted :: ', deleteResult.rowCount);
            let insertedResult = await client.query(insertIntoScoreTable);
            console.log('No. of rows inserted :: ', insertedResult.rowCount);


            if (score.action === 'submit') {
                let updateSubmittedStatus = `update t_event_cat_staff_map set is_score_submitted = true
                                   where event_id = ${score.eventId} and user_id= ${score.judge};`;

                await client.query(updateSubmittedStatus);
                console.log(`${score.judge} user updated is_score_submitted for event id: ${score.eventId}`)
            }

            await client.query('DROP TABLE t_temp_score;');

            await client.query('commit;');

        }

        return {
            data: {
                status: 'success'
            }
        }

    } catch (error) {

        await client.query('rollback;');
        dbConnections.endConnection(client);
        console.error(`reqScoreOperations.js::persistParticipantScore() : ${error}`);
        return (errorHandling.handleDBError('connectionError'));

    } finally {
        client.release(false);
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
        if (result.rows[0].approved_count = result.rows[0].total_judges_count) {

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

    console.log('getScoreByCategory called, Event Id = ' + eventId + ', Category Id = ' + eventCategoryId);


    let scores = [];

    let client = await dbConnections.getConnection();

    try {

        /********************** scores *******************************************************************************************/
        // const eventQuery = `select distinct  tecm.event_category_id
        //                             , tepr.enrollment_id
        //                             , tecsm.user_id staff_id
        //                             , tu.first_name , tu.last_name 
        //                             , tpes.score 
        //                             ,concat(tu2.title,'.',' ',tu2.first_name,' ', tu2.middle_name, ' ',tu2.last_name) participant_name
        //                             ,to2."name" parish_name
        //                         from t_event_category_map tecm 
        //                         join t_event_cat_staff_map tecsm on tecsm.event_id = tecm.event_id and tecsm.event_category_map_id = tecm.event_cat_map_id 
        //                         join t_event_participant_registration tepr on tepr.event_id = tecm.event_id 
        //                         join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id
        //                              and tperc.event_category_id = tecm.event_category_id  and tperc.has_attended = true 
        //                         left join t_participant_event_score tpes on tpes.participant_event_reg_cat_id = tperc.participant_event_reg_cat_id and tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id 
        //                         join t_user tu on tu.user_id = tecsm.user_id
        //                         join t_user tu2 on tepr.user_id = tu2.user_id
        //                         join t_organization to2 on to2.org_id = tu2.org_id 
        //                         where tecm.event_id = ${eventId} and tecm.event_category_id = ${eventCategoryId} order by 1,2,3 ;`


        const eventQuery = `select distinct  tecm.event_category_id
                                    , tepr.enrollment_id
                                    , tecsm.user_id staff_id
                                    , concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ',tu.last_name) 
                                    , tpes.score 
                                    ,concat(tu2.title,'.',' ',tu2.first_name,' ', tu2.middle_name, ' ',tu2.last_name) participant_name
                                    ,to2."name" parish_name
                            from t_event_category_map tecm 
                                join t_event_cat_staff_map tecsm on tecsm.event_id = tecm.event_id and tecsm.event_category_map_id = tecm.event_cat_map_id 
                                join t_event_participant_registration tepr on tepr.event_id = tecm.event_id and tepr.event_id =  ${eventId}
                                join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id
                                    and tperc.event_category_id = tecm.event_cat_map_id and tperc.has_attended = true 
                                left join t_participant_event_score tpes on tpes.participant_event_reg_cat_id = tperc.participant_event_reg_cat_id 
                                and tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id 
                                join t_user tu on tu.user_id = tecsm.user_id
                                join t_user tu2 on tepr.user_id = tu2.user_id
                                join t_organization to2 on to2.org_id = tu2.org_id 
                                where tecm.event_id = ${eventId}  and tecm.event_cat_map_id = ${eventCategoryId} order by 1,2,3;`;

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

            //console.log(`Stringified JSON is : ` + JSON.stringify(scores))

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