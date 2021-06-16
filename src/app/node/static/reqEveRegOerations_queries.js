

const getEventData = `select distinct te.event_id,
                        te."name" event_name,
                        te.event_type,
                        tepr.enrollment_id,
                        tepr.user_id,
                        te.description,
                        te.start_date,
                        te.end_date,
                        te.registration_start_date,
                        te.registration_end_date,
                        te.event_url,
                        tea.attachment_name,
                        tea.attachment_type,
                        tea.event_attachment_id,
                        tea.file_name,
                        tv.venue_id,
                        tv."name" venue_name,
                        tec."name" cat_name, 
                        tec.event_category_id,
                        tecm.event_cat_map_id,
                        tev.event_venue_id,
                        teq.question_id,
                        teq.question,
                        teq.answer_type  
                        from t_event te 
                        left join t_event_participant_registration tepr on tepr.event_id = te.event_id 
                            and tepr.user_id = $2 and tepr.event_id = $1
                        left join t_event_attachment tea on tea.event_id = tepr.event_id
                        left join t_event_venue tev on tev.event_id = $1
                        left join t_venue tv on tv.venue_id = tev.venue_id
                        left join t_event_category_map tecm on tecm.event_id = $1
                        left join t_event_category tec on tecm.event_category_id = tec.event_category_id
                        left join t_event_questionnaire teq on teq.event_id = $1
                        where te.event_id = $1;`;

module.exports = {
    getEventData
}                            


