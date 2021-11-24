const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);

async function persistParticipantScore(userScoreData, loggedInUser) {

    let client = await dbConnections.getConnection();

    try {
        let flag = false;

        console.log("userScoreData", userScoreData);
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


                insertIntoScoreTable = `  insert into t_participant_event_score (participant_event_reg_cat_id, event_cat_staff_map_id, score, created_by, created_date, event_participant_registration_id)
                                                        select distinct tecsm.event_category_map_id , tecsm.event_cat_staff_map_id, tts.score, ${loggedInUser}, current_timestamp, tepr.event_participant_registration_id 
                                                        from t_temp_score tts join t_event_category tec on tec."name" = tts.event_category_name
                                                left join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                                                and tecm.event_id = ${score.eventId} 
                                                join t_event_participant_registration tepr on tts.enrollment_id  = tepr.enrollment_id 
                                                    and tepr.registration_status = 'Registered'
                                                left join t_event_cat_staff_map tecsm on  tecsm.event_category_map_id = tecm.event_cat_map_id 
                                                and tecsm.user_id = ${score.judge}  and tecsm.is_deleted = false
                                                join t_organization to2 on to2.org_id = tecsm.role_id
                                                join t_student_sundayschool_dtl tssd on tssd.school_grade = to2."name"
                                                and tepr.user_id = tssd.student_id;`;

                let deleteResult = await client.query(deleteFromScoreTable);
                console.log('No. of rows deleted from t_participant_event_score are ', deleteResult.rowCount);
                let insertedResult = await client.query(insertIntoScoreTable);
                console.log('No. of rows inserted in t_participant_event_score are :: ', insertedResult.rowCount);


                if (EveTypeResult.rows[0].event_type === 'Sunday School Midterm Exam') {

                    console.debug('Inserting score into t_participant_event_overall_score table');
                    let deleteOverAllScore = `delete from t_participant_event_overall_score where event_participant_registration_id in (
                    select tepr.event_participant_registration_id from t_event_participant_registration tepr 
                            join t_event_category_map tecm on tepr.event_id = tecm.event_id 
                            and  tepr.event_id = ${score.eventId} 
                            join t_participant_event_overall_score tpeos 
                            on tpeos.event_category_map_id = tecm.event_cat_map_id
                            and tpeos.participant_event_reg_cat_id = ${score.judge})`;

                    let insertOverAllScore = `INSERT INTO t_participant_event_overall_score
                                        (event_category_map_id, event_participant_registration_id, overall_score, participant_event_reg_cat_id)
                                        select tecm.event_cat_map_id, tepr.event_participant_registration_id, tts.score, ${score.judge}
                                            from t_event_participant_registration tepr 
                                                    join t_temp_score tts on tepr.enrollment_id = tts.enrollment_id 
                                                    and tepr.is_deleted = false and tepr.registration_status = 'Registered'
                                                    join t_event_category_map tecm on tecm.event_id = tepr.event_id 
                                                    where tepr.event_id = ${score.eventId};`

                    let delRes = await client.query(deleteOverAllScore);
                    console.debug(`for event ${score.eventId}, ${delRes.rowCount} records have been deleted.`);
                    let insRes = await client.query(insertOverAllScore);
                    console.debug(`for event ${score.eventId}, ${insRes.rowCount} new records have been inserted.`);

                } else if (EveTypeResult.rows[0].event_type === 'Sunday School Final Exam') {
                    console.debug('Inserting score into t_participant_event_overall_score table.');
                    let getMidTermEventId = `select distinct te2.event_id event_id
                                                    from t_event te
                                                join t_event_organization teo on te.event_id = teo.event_id 
                                                    and te.event_id = ${score.eventId} and te.is_deleted = false
                                                join t_event_organization teo2 on teo.org_id = teo2.org_id 
                                                join t_event te2 on teo2.event_id = te2.event_id
                                                            and te2.event_type = 'Sunday School Midterm Exam' 
                                                join t_school_term_detail tstd on te2.start_date between tstd.term_start_date and tstd.term_end_date 
                                                            and current_date <= tstd.term_end_date and current_date >= tstd.term_start_date
                                                            and tstd.is_deleted = false;`;

                    let pertainingEvt = await client.query(getMidTermEventId);

                    if (pertainingEvt.rowCount === 1) {

                        console.debug(`${pertainingEvt.rowCount} Sunday School Midterm Exam event(s) found pertaining to ${score.eventId} Sunday School Final Exam.`)

                        let deleteFinalTermOverAllScore = `delete from t_participant_event_overall_score where event_participant_registration_id 
                        	in (select event_participant_registration_id from t_event_participant_registration where  event_id = ${score.eventId} );`;

                        let insertFinalTermOverAllScore = `	INSERT INTO t_participant_event_overall_score
                                                        (event_category_map_id, event_participant_registration_id, overall_score, participant_event_reg_cat_id)
                                                            select tpes2.participant_event_reg_cat_id, tepr.event_participant_registration_id, (tpes.score + tpes2.score) /2, ${loggedInUser} 
                                                                    from t_event_participant_registration tepr 
                                                                    join t_event_participant_registration tepr2 on tepr.user_id =  tepr2.user_id 
                                                                        and  tepr.event_id = ${score.eventId} 
                                                                        and tepr2.event_id = ${pertainingEvt.rows[0].event_id}
                                                                    join t_participant_event_score tpes on tepr.event_participant_registration_id = tpes.event_participant_registration_id 
                                                                    join t_participant_event_score tpes2 on tepr2.event_participant_registration_id = tpes2.event_participant_registration_id;`;


                        let delRes = await client.query(deleteFinalTermOverAllScore);
                        console.debug(`for event ${score.eventId}, ${delRes.rowCount} records have been deleted.`);
                        let insRes = await client.query(insertFinalTermOverAllScore);
                        console.debug(`for event ${score.eventId}, ${insRes.rowCount} new records have been inserted.`);
                    } else if (pertainingEvt.rowCount > 0) throw `For Sunday School final Term Event ${score.eventId}, Multiple pertaining Midterm exam events found.`;
                    else throw `For Sunday School final Term Event ${score.eventId}, Pertaining Midterm exam event not found.`;
                }




            }
            else if (EveTypeResult.rows[0].event_type === 'TTC' || EveTypeResult.rows[0].event_type === 'Diploma Exam') {
                console.log("TTC OR DIPLOMA EXAM");




                deleteFromScoreTable = `delete from t_participant_event_score where participant_event_score_id in(	
                                select 
                                        tpes.participant_event_score_id 
                                from t_event_evaluator tee
                                    join  t_event_participant_registration tepr on tee.event_id = tepr.event_id 
                                        and tee.event_id = ${score.eventId} and tee.user_id = ${score.judge} and tee.is_deleted = false
                                left join t_participant_event_score tpes on tpes.event_evaluator_id = tee.event_evaluator_id
                                    and tpes.is_deleted = false
                                );`;



                insertIntoScoreTable = `insert into t_participant_event_score (event_evaluator_id, score, created_by, created_date, event_participant_registration_id)
                                
                                                    select distinct tee.event_evaluator_id, tts.score, ${loggedInUser}, current_timestamp, tepr.event_participant_registration_id
                                                    from t_temp_score tts join t_event_category tec on tec."name" = tts.event_category_name
                                                                        
                                                        join t_event_participant_registration tepr on tts.enrollment_id = tepr.enrollment_id 
                                                        and tepr.registration_status = 'Registered'
                                                        left join t_event_evaluator tee on tepr.event_id = tee.event_id 
                                                        and tee.event_id = ${score.eventId} 
                                                        and tee.user_id = ${score.judge} and tee.is_deleted = false`;

                let deleteResult = await client.query(deleteFromScoreTable);
                console.log('No. of rows deleted from t_participant_event_score are ', deleteResult.rowCount);
                let insertedResult = await client.query(insertIntoScoreTable);
                console.log('No. of rows inserted in t_participant_event_score are :: ', insertedResult.rowCount);




            }
            else {
                console.log("Else CONDITION");
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
                                                        and  tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id and tecsm.is_deleted = false);`;


                insertIntoScoreTable = `insert into t_participant_event_score (participant_event_reg_cat_id, event_cat_staff_map_id, score, created_by, created_date, event_participant_registration_id)
                                            select tperc.participant_event_reg_cat_id, tecsm.event_cat_staff_map_id, tts.score, ${loggedInUser}, current_timestamp, tepr.event_participant_registration_id  from t_temp_score tts join t_event_category tec on tec."name" = tts.event_category_name
                                            join t_event_category_map tecm on tec.event_category_id = tecm.event_category_id 
                                            and tecm.event_id = ${score.eventId} 
                                            join t_event_participant_registration tepr on tts.enrollment_id  = tepr.enrollment_id 
                                        join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id
                                            and tperc.event_category_id = tecm.event_cat_map_id 
                                        join t_event_cat_staff_map tecsm on  tecsm.event_category_map_id = tecm.event_cat_map_id 
                                            and tecsm.user_id = ${score.judge} and tecsm.is_deleted = false`;

                let deleteResult = await client.query(deleteFromScoreTable);
                console.log('No. of rows deleted from t_participant_event_score are ', deleteResult.rowCount);
                let insertedResult = await client.query(insertIntoScoreTable);
                console.log('No. of rows inserted in t_participant_event_score are :: ', insertedResult.rowCount);


                if (userScoreData.action === 'approve' && flag === false) {
                    if (EveTypeResult.rows[0].event_type === 'CWC' || EveTypeResult.rows[0].event_type === 'Talent Competition') {
                        flag = true;
                        await calculateScore(client, score.eventId, userScoreData.catId);
                        const setIsApproved = `update t_event_cat_staff_map set is_score_approved = true where event_category_map_id = ${userScoreData.catId} and is_deleted = false;`;
                        await client.query(setIsApproved);
                    }
                }


            }



            if (score.action === 'submit') {
                let updateSubmittedStatus = `update t_event_cat_staff_map set is_score_submitted = true
                                   where event_id = ${score.eventId} and user_id= ${score.judge};`;

                await client.query(updateSubmittedStatus);
                console.log(`${score.judge} user updated is_score_submitted for event id: ${score.eventId}`);


                if (EveTypeResult.rows[0].event_type === 'TTC' || EveTypeResult.rows[0].event_type === 'Diploma Exam') {
                    let updateSubmittedStatusForEvaluator = `update t_event_evaluator set is_score_submitted = true
                                   where event_id = ${score.eventId} and user_id= ${loggedInUser};`;

                    await client.query(updateSubmittedStatusForEvaluator);
                    console.log(`${score.judge} user updated is_score_submitted for event id: ${score.eventId}`);
                }
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

    //and tecsm.is_score_approved = true approved as
    // First check if the score for all the judges is approved 
    let approvedCountQuery = `with approved as (select tecm.event_cat_map_id , count(tecsm.event_cat_staff_map_id) approved
                                    from t_event_category_map tecm, t_event_cat_staff_map tecsm
                                    where tecsm.event_id = tecm.event_id 
                                    and tecsm.event_category_map_id = tecm.event_cat_map_id 
                                    and tecsm.is_deleted = false
                                    group by tecm.event_cat_map_id
                                    )	,
                                    total_judges as (select tecm.event_cat_map_id , count(tecsm.event_cat_staff_map_id) total
                                    from t_event_category_map tecm, t_event_cat_staff_map tecsm
                                    where tecsm.event_id = tecm.event_id 
                                    and tecsm.event_category_map_id = tecm.event_cat_map_id 
                                    and tecsm.role_type = 'Judge'
                                    and tecsm.is_deleted = false	
                                    group by tecm.event_cat_map_id
                                    )
                                    select tecm.event_id, tecm.event_cat_map_id, approved.approved approved_count , total_judges.total total_judges_count
                                    from t_event_category_map tecm 
                                    left join approved  on approved.event_cat_map_id = tecm.event_cat_map_id 
                                    left join total_judges on total_judges.event_cat_map_id = tecm.event_cat_map_id 
                                    where tecm.event_id = ${eventId} and tecm.event_cat_map_id = ${eventCategoryMapId};`

    let result = await client.query(approvedCountQuery);
    console.log("result", result.rows);
    console.info('approvedCountQuery result == > ', result.rowCount)

    if (result && result.rowCount > 0) {
        console.info("Query result ==>", result.rows[0].approved_count, result.rows[0].total_judges_count);
        if (result.rows[0].approved_count == result.rows[0].total_judges_count) {

            console.info('Score is approved for the category. Insert overall score');

            //and tecsm.is_score_approved = true approved as
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
                                    and tecsm.is_deleted = false 
                                    
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
            console.log("666");

            console.info("Inserted record count :: ", result.rowCount)
        }
    }

    //    return client;

    //  } catch (error) {
    // await client.query('rollback;');
    //   throw error;
    //} 

}


async function getScoreByCategory(eventId, eventCategoryId, loggedInUser) {

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


        // const eventQuery = `select distinct  tecm.event_category_id
        //                             , tepr.enrollment_id
        //                             , tecsm.user_id staff_id
        //                             , concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ',tu.last_name) 
        //                             , tpes.score 
        //                             ,concat(tu2.title,'.',' ',tu2.first_name,' ', tu2.middle_name, ' ',tu2.last_name) participant_name
        //                             ,to2."name" parish_name
        //                     from t_event_category_map tecm 
        //                         join t_event_cat_staff_map tecsm on tecsm.event_id = tecm.event_id and tecsm.event_category_map_id = tecm.event_cat_map_id 
        //                         join t_event_participant_registration tepr on tepr.event_id = tecm.event_id and tepr.event_id =  ${eventId}
        //                         join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id
        //                             and tperc.event_category_id = tecm.event_cat_map_id  

        //                          join t_participant_event_score tpes on tpes.participant_event_reg_cat_id = tperc.participant_event_reg_cat_id 
        //                         and tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id 
        //                         join t_user tu on tu.user_id = tecsm.user_id
        //                         join t_user tu2 on tepr.user_id = tu2.user_id
        //                         join t_organization to2 on to2.org_id = tu2.org_id 
        //                         where tecm.event_id = ${eventId}  and tecm.event_cat_map_id = ${eventCategoryId} order by 1,2,3;`;




        const eventQuery = `select distinct  tecm.event_category_id
                                , tepr.enrollment_id
                                , tecsm.user_id staff_id
                                , concat(tu.title,'. ',tu.first_name,' ', tu.middle_name, ' ',tu.last_name) 
                                , tpes.score 
                                ,concat(tu2.title,'.',' ',tu2.first_name,' ', tu2.middle_name, ' ',tu2.last_name) participant_name
                                ,to2."name" parish_name
                        from t_event_category_map tecm 
                            join t_event_cat_staff_map tecsm on tecsm.event_id = tecm.event_id and tecsm.event_category_map_id = tecm.event_cat_map_id 
                            join t_event_participant_registration tepr on tepr.event_id = tecm.event_id and tepr.event_id = ${eventId}
                            join t_participant_event_reg_cat tperc on tperc.event_participant_registration_id = tepr.event_participant_registration_id
                                and tperc.event_category_id = tecm.event_cat_map_id                             
                             join t_participant_event_score tpes on tpes.participant_event_reg_cat_id = tperc.participant_event_reg_cat_id 
                            and tpes.event_cat_staff_map_id = tecsm.event_cat_staff_map_id 
                            join t_user tu on tu.user_id = tecsm.user_id
                            join t_user tu2 on tepr.user_id = tu2.user_id and tu2.org_id 
                            in 
                            (WITH recursive child_orgs 
                                AS (
                                SELECT org_id
                                FROM   t_organization parent_org 
                                WHERE  org_id IN
                                        ( 
                                                 SELECT a.org_id
                                                    FROM   t_user_role_context a, t_user b
                                                    WHERE  b.user_id = ${loggedInUser}       
                                                    AND    a.user_id = b.user_id
                                    ) 
                                union 
                                SELECT     child_org.org_id child_id
                                FROM       t_organization child_org
                                INNER JOIN child_orgs c
                                ON         c.org_id = child_org.parent_org_id ) SELECT *
                                    FROM   child_orgs) 
                            join t_organization to2 on to2.org_id = tu2.org_id 
                            where tecm.event_id = ${eventId}  and tecm.event_cat_map_id = ${eventCategoryId} order by 1,2,3;`;


        //and tperc.has_attended = true  342
        //left 343

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

            if (_.findWhere(scores, score) == null) {
                scores.push(score);
            }



            //console.log(`Stringified JSON is : ` + JSON.stringify(scores))

        }

        const isScoreApproved = `select event_category_map_id, is_score_approved from t_event_cat_staff_map where event_category_map_id = ${eventCategoryId} and is_deleted = false;`;
        let res = await client.query(isScoreApproved);
        isApproved = res.rows[0].is_score_approved;

        return ({
            data: {
                status: 'success',
                scoreData: scores,
                isApproved: isApproved
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