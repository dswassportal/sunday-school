

const getEventData = `select distinct te.event_id,
                        te."name" event_name,
                        te.event_type,
                        tepr.event_participant_registration_id,
                        tepr.enrollment_id,
                        tepr.user_id,
                        te.description,
                        tepr.role,
                        tepr.event_venue_id selected_event_venue_id,
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
                        tperc.event_category_id selected_cat,
                        tv."name" venue_name,
                        tec."name" cat_name, 
                        tec.event_category_id,
                        tecm.event_cat_map_id,
                        tev.event_venue_id,
                        teq.question_id,
                        teq.question,
                        teq.answer_type,
                        teqr.answer   
                        from t_event te 
                        left join t_event_participant_registration tepr on tepr.event_id = te.event_id 
                            and tepr.user_id = $2 and tepr.event_id = $1 and tepr.is_deleted != true
                        left join t_event_attachment tea on tea.event_id = tepr.event_id
                        left join t_event_venue tev on tev.event_id = $1
                        left join t_venue tv on tv.venue_id = tev.venue_id
                        left join t_event_category_map tecm on tecm.event_id = $1
                        left join t_event_category tec on tecm.event_category_id = tec.event_category_id
                        left join t_participant_event_reg_cat tperc 
                        	on tperc.event_participant_registration_id = tepr.event_participant_registration_id 
                            and  tecm.event_cat_map_id = tperc.event_category_id 
                        	and tperc.is_deleted != true
                        left join t_event_questionnaire teq on teq.event_id = $1
                        left join t_event_question_response teqr 
                        	on teqr.event_participant_registration_id = tepr.event_participant_registration_id 
                            and teq.question_id = teqr.question_id
                        where te.event_id = $1;`;

const getParticipantRolesFormLookup = `select jsonb_agg(
                                            jsonb_build_object(
                                                'roleDesc', tl.description,
                                                'code', tl.code 
                                                ) order by "sequence"
                                            ) parti_role
                                        from t_lookup tl where "type" = 'Participant Role' 
                                        and is_deleted != true;`;

const getEventSectionConfigByEveType = `select
                                            jsonb_build_object(
                                                'eventTypeId', tet.event_type_id,
                                                'isVenueRequired', tet.is_venue_required,
                                                'isProctorRequired', tet.is_proctor_required,
                                                'isJudgeRequired', tet.is_judge_required,
                                                'isSchoolGradeRequired', tet.is_school_grade_required,
                                                'isCategoryRequired', tet.is_category_required,
                                                'isSingleDayEvent', tet.is_single_day_event,
                                                'isSchoolGroupRequired', tet.is_school_group_required,
                                                'isEvaluatorRequired', tet.is_evaluator_required,
                                                'isQuestionnaireRequired', tet.is_questionnaire_required,
                                                'isAttachmentRequired', tet.is_attachment_required,
                                                'isUrlRequired', tet.is_url_required
                                            ) event_sec_config
                                            from t_event_type tet where tet."name" = $1 
                                            and tet.is_deleted != true;`;       
                                            
const checkGeneratedEnrollmentNoExists = `select case when count(enrollment_id) = 0 then false
                                            else true end ran_no from t_event_participant_registration 
                                            where enrollment_id =$1;`
                                            
const newRegistration = `INSERT INTO t_event_participant_registration
                            (event_id, user_id, school_grade, is_deleted, created_by, created_date, enrollment_id, event_venue_id, registration_status)
                            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning event_participant_registration_id;`
                            
const insertRegCatMapping = `INSERT INTO t_participant_event_reg_cat
                            (event_participant_registration_id, event_category_id, user_id, is_deleted, created_by, created_date)
                            VALUES $1 returning participant_event_reg_cat_id;`; 
                            
const insertRegQueResp = `INSERT INTO t_event_question_response
                            (event_participant_registration_id, question_id, answer, created_by, created_date)
                            VALUES $1  returning question_response_id;`; 
                            
const updateEventRegistration = `UPDATE t_event_participant_registration
                                SET updated_by=$1, updated_date=$2, event_venue_id=$3, registration_status=$4 
                                WHERE event_participant_registration_id=$5;`;      
                                
const updateEventRegCatMapping = `INSERT INTO t_participant_event_reg_cat(event_participant_registration_id, event_category_id, user_id, is_deleted, updated_by, updated_date)               
                                    SELECT $1, $2, $3, $4, $5, $6 
                                    WHERE NOT EXISTS (
                                        SELECT 1 FROM t_participant_event_reg_cat  
                                                                WHERE event_participant_registration_id = $1
                                                                and event_category_id = $2
                                                                and user_id = $3
                                                                and is_deleted != true
                                                                ) returning participant_event_reg_cat_id;`;      
 
const deleteCatMapping = `update t_participant_event_reg_cat 
                                set is_deleted= $1, updated_by= $2, updated_date= $3 
                                where event_participant_registration_id= $4 and event_category_id not in ($5) returning participant_event_reg_cat_id;`;    
                                
const updateRegQuestionRes = `UPDATE t_event_question_response
                                SET answer=$1, updated_by=$2, updated_date=$3
                                WHERE event_participant_registration_id=$4 and question_id=$5 returning question_response_id;`;                                
                                                                

module.exports = {
    getEventData,
    getParticipantRolesFormLookup,
    getEventSectionConfigByEveType,
    checkGeneratedEnrollmentNoExists,
    newRegistration,
    insertRegCatMapping,
    insertRegQueResp,
    updateEventRegistration,
    updateEventRegCatMapping,
    deleteCatMapping,
    updateRegQuestionRes
}                            


