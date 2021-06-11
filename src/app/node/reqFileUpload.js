const _ = require('underscore');
const errorHandling = require('./ErrorHandling/commonDBError');
const dbConnections = require(`${__dirname}/dbConnection`);
const path = require('path');


async function eventDocUpload(files, eventId) {

    let client = await dbConnections.getConnection();
    try {
        await client.query("begin;");

        let query = `INSERT INTO t_event_attachment
            (event_id, attachment_type, attachment, attachment_name, file_name)
            VALUES($1, $2, $3, $4, $5) returning event_attachment_id;`
        if (files) {
            let attchIds = [];
            let count = 0;
            for (;;) {
                if(files[`${count}`] !== undefined){
                   let file = files[`${count}`]
                console.log(" documents.mimetype : " + file.mimetype +' file.documents.name:'+ file.name);
                let values = [eventId,
                    file.mimetype,
                    file.data,
                    file.name,
                    file.name]
                let insResult = await client.query(query, values);
                if (insResult.rowCount > 0)
                    attchIds.push(insResult.rows[0].event_attachment_id);
                    count++;
                }else break;
            }
            console.log(`for event ${eventId}, New attachment Ids are ${JSON.stringify(attchIds)}`)
        }
        await client.query("commit;");
        // //code to latest uploded file get file
        // if (insResult.rowCount) {
        //     await client.query("commit;");
        //     let attachmentId = insResult.rows[0].event_attachment_id;

        //     console.log(`ID for event newly uploaded document is ${attachmentId}`);

        //     let getAttchmntQry = `select  attachment, attachment_type, attachment_name 
        //         from t_event_attachment where event_attachment_id = $1;`

        //     let result = await client.query(getAttchmntQry, [attachmentId]);

        //     if (result.rowCount > 0) {

        //         return ({
        //             data: {
        //                 status: "success",
        //                 fileName: result.rows[0].attachment_name,
        //                 mimeType: result.rows[0].attachment_type,
        //                 fileData: result.rows[0].attachment
        //             }
        //         })

        //     } else throw `No data present for ${attachmentId} event_attachment_id.`;
        // } else throw `Failed to insert file into table.`;

        return ({
            data: {
                status: "success"
            }
        })


    } catch (error) {
        console.error('reqFileUpload.js::eventDocUpload() error as : ' + error);
        await client.query("rollback;");
        return (errorHandling.handleDBError('connectionError'));

    } finally {
        client.release();
    }

}


module.exports = {
    eventDocUpload
}