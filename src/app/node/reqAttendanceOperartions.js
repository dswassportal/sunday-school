const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);


async function persistParticipantAttendance(attData, loggedInUser) {

    let client = await dbConnections.getConnection();
    try {
        await client.query('begin;');
        console.log('Marking attendance, action is : ' + attData.action + ' and marked by(Proctor) ' + loggedInUser);
        let action = attData.action;
        if (action === 'save') {
            console.log(`Total participants to mark 'present' : ${attData.present.length} and 'absent' : ${attData.absent.length}`)

            if (attData.present.length > 0) {
                let arrAsString = attData.present.join(',');
                let markPresentQry = `update t_event_participant_registration set has_attended = ${true}
                                        where event_participant_registration_id in (${arrAsString});`;

                let presentRes = await client.query(markPresentQry);
                if(presentRes.rowCount > 0)
                    console.debug(`for event ${attData.eventId},  ${presentRes.rowCount} participants marked as atteneded.`);
            }
            if (attData.absent.length > 0) {
                let arrAsString = attData.absent.join(',');
                let markAbsentQry = `update t_event_participant_registration set has_attended = ${false}
                                        where event_participant_registration_id in (${arrAsString});`;

                let absentRes = await client.query(markAbsentQry);
                if(absentRes.rowCount > 0)
                    console.debug(`for event ${attData.eventId},  ${absentRes.rowCount} participants marked as absent.`);
            }

        }
        if (action === 'submit') {

            let markAttSubmitted = `update t_event_venue set is_attendance_submitted = true 
                                    where proctor_id = ${loggedInUser} 
                                    and event_id= ${attData.eventId};`;

            await client.query(markAttSubmitted);
            console.log(`for event ${attData.eventId}, attendance has been submitted!`);
            console.log(`calling persistParticipantAttendance() again to persist attendance marking.`);
            attData.action = 'save';
            persistParticipantAttendance(attData, loggedInUser);
        }

        await client.query('commit;');
        return {
            data: {
                status: 'success'
            }
        }

    } catch (error) {
        await client.query('rollback;');
        console.error(`reqAttendanceOperations.js::persistParticipantAttendance() --> error executing query as : ${error}`);
        return (errorHandling.handleDBError('connectionError'));
    } finally {
        client.release();
    }
}

module.exports = {
    persistParticipantAttendance
}