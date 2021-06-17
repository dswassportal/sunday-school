

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

module.exports = {
    getEventData,
    getParticipantRolesFormLookup,
    getEventSectionConfigByEveType
}                            


