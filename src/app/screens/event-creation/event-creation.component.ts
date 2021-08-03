import { ViewChild } from '@angular/core';
import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { GridOptions, GridApi } from "ag-grid-community";
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { uiCommonUtils } from 'src/app/common/uiCommonUtils';
import { EventDataService } from '../events/event.dataService';
import { Router } from '@angular/router';
declare let $: any;


import { Moment } from 'moment';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';

const moment = _rollupMoment || _moment;
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ElementRef } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';


class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = ' MMMM DD YYYY';
    return moment(date).format(formatString);
  }
}

@Component({
  selector: 'app-event-creation',
  templateUrl: './event-creation.component.html',
  styleUrls: ['./event-creation.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: CustomDateAdapter
    }
  ]
})

export class EventCreationComponent implements OnInit {

  formData = new FormData();
  eventsDataFormGroup: any;
  eventCategoriesFormGroup: any;
  eventGroupsFormGroup: any;
  eventCatGroupMapFormGroup: any;
  eventVenueAssignFormGroup: any;
  eventProctorAssignFormGroup: any;
  eventJudgeAssignFormGroup: any;
  questionnaireDataFormGroup: any;
  eventEvaluatorAssignFormGroup: any;
  eventGradeEvalAssignFormGroup: any;

  gridOptionsCat: any;
  gridOptionsGroups: any;
  gridOptionsVenues: any;
  columnDefsCat!: any[];
  columnDefsGroup!: any[];
  columnDefsVenues!: any[];
  gradeListDropdownValues!: any[];
  groupsDropdownValues!: any[];
  judgesDropdownValues!: any[];
  evaluatorDropdownValues!: any[];
  regionDropdownValues!: any;
  catPopUpName: any;
  catPopUpDesc: any;
  selectedItemsGradeListPopUp: any;
  dropdownSettingsGradeList: any;
  dropdownSettingsGroups: any;
  dropdownSettingsProctor: any;
  dropdownSettingsRegion: any;
  dropdownSettingsJudges: any;
  dropdownSettingsEvaluator: any;
  dropdownSettingsResponseType: any;
  dropdownSettingsEventType: any;
  dropdownSettingsEventCoordinator: any;
  dropdownSettingsEventLevel: any;
  dropdownSettingsEventExecutedBy: any;
  rowDataCat: any = [];
  rowDataGroups: any = [];
  rowDataVenues: any = [];
  catGridApi: any;
  groupsGridApi: any;
  venuesGridApi: any;
  eventCatGroupMapdata!: any[];
  proctorDropdownValues: any;
  responseTypeDropdownValues: any;
  venueListData: any;
  selectedCategories: any;
  eventType: any;

  isVenueRequired: any;
  isProctorRequired: any;
  isJudgeRequired: any;
  isSchoolGradeRequired: any;
  isCategoryRequired: any;
  isSingleDayEvent: any;
  isSchoolGroupRequired: any;
  isEvaluatorRequired: any;
  isQuestionnaireRequired: any;
  isAttachmentRequired: any;
  isUrlRequired: any;
  isEvalSecNextButtonRequired: any;
  selectedEvaluatorsDropdown: any;







  eventCreationForm: any;
  venuesDataFormGroup: any;
  eventId: any;
  selectedRegion: any;
  venues: any;
  questionnaire: any;
  term: any;
  alluserdata: any;
  orgId: any;
  userId: any;
  selectedOrg: any;
  orgDetails: any;
  eventsDataUpdate: any;
  rolesArr: any[] = [];
  orgs!: any[];
  isLinear!: boolean;
  eventFormLabel!: boolean;
  evntTypedisabled!: boolean;
  venuesdataOfdata!: any[];
  venuesList!: any[];
  eventList!: any[];
  regionList!: any[];
  parishList!: any[];
  proctorData!: any[];
  rolesData!: any[];
  eventcategories: any;
  eventcategorydata!: any[];
  eventarray!: any[];
  eventCategoryForm!: FormGroup;
  ISCategory!: any[];
  newVenues!: any[];
  eventStartDateMin: any;
  eventEndDateMax: any;
  isQuestionnariesRequired!: boolean;
  public myreg = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi
  minDate = new Date();
  selectedRowJson: any = {};
  gradeEvaluatorAssignmentData: any;
  isGradewiseEvaluatorsRequired: any;
  gradewiseEvaluatorDropdownValues: any;
  dropdownSettingsEvaluatorDropdownValues: any;

  error: any;
  fileUpload = { status: '', message: '', filePath: '' };

  constructor(private apiService: ApiService,
    private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils,
    private eventDataService: EventDataService, private router: Router,
  ) { }

  dropdownSettingForGardeList: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForGroups: IDropdownSettings = {
    singleSelection: false,
    idField: 'gradeGroupMapId',
    textField: 'gradeGroupName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForProctor: IDropdownSettings = {
    singleSelection: true,
    idField: 'proctorId',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForRegion: IDropdownSettings = {
    singleSelection: true,
    idField: 'regionId',
    textField: 'regionName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };


  dropdownSettingForJudges: IDropdownSettings = {
    singleSelection: false,
    idField: 'judgeId',
    textField: 'judgeName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForResponseType: IDropdownSettings = {
    singleSelection: true,
    idField: 'responseTypeDropdownValues',
    textField: 'responseTypeDropdownValues',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForEvaluators: IDropdownSettings = {
    singleSelection: false,
    idField: 'evalId',
    textField: 'evalName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForEventType: IDropdownSettings = {
    singleSelection: true,
    idField: 'eventType',
    textField: 'eventType',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForEventCoordinator: IDropdownSettings = {
    singleSelection: false,
    idField: 'userId',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForEventLevel: IDropdownSettings = {
    singleSelection: true,
    idField: 'orgtype',
    textField: 'orgtype',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForEventExecutedBy: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForEvaluatorDropdownValues: IDropdownSettings = {
    singleSelection: false,
    idField: 'userId',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };




  onSelectedFile(event: any) {
    if (event.target.files.length > 0) {

      let count = 0;
      for (let file of event.target.files)
        this.formData.append(`${count++}`, file);

    }
  }


  getData() {

    this.apiService.getRegionAndParish().subscribe((res: any) => {
      this.regionList = res.data.metaData.regions;
    });

    this.apiService.getEventType().subscribe((res: any) => {
      this.eventList = res.data.metaData.eventType;
      this.eventcategorydata = res.data.metaData.eventType;

      let eventType: any;
      if (this.eventFormLabel == false) {   // insert screen
        eventType = this.eventsDataFormGroup.value.eventType[0].eventType;
      }
      else {
        eventType = this.eventsDataFormGroup.value.eventType[0];
      }


      // For showing and hiding different sections and fields as per eventType
      for (let i = 0; i < this.eventList.length; i++) {
        if (this.eventList[i].eventType == eventType) {
          this.isVenueRequired = this.eventList[i].isVenueRequired;
          this.isProctorRequired = this.eventList[i].isProctorRequired;
          this.isJudgeRequired = this.eventList[i].isJudgeRequired;
          this.isSchoolGradeRequired = this.eventList[i].isSchoolGradeRequired;
          this.isCategoryRequired = this.eventList[i].isCategoryRequired;
          this.isSingleDayEvent = this.eventList[i].isSingleDayEvent;
          this.isSchoolGroupRequired = this.eventList[i].isSchoolGroupRequired;
          this.isEvaluatorRequired = this.eventList[i].isEvaluatorRequired;
          this.isQuestionnaireRequired = this.eventList[i].isQuestionnaireRequired;
          this.isAttachmentRequired = this.eventList[i].isAttachmentRequired;
          this.isUrlRequired = this.eventList[i].isUrlRequired;
          this.isGradewiseEvaluatorsRequired = this.eventList[i].isGradewiseEvaluatorsRequired;
          this.eventType = this.eventList[i].eventType;
        }
      }
    });

    this.apiService.getUserRoleData().subscribe(res => {
      this.orgs = res.data.metadata.orgs;
      try {
        let temp = { orgtype: this.eventsDataUpdate.orgType, id: this.eventsDataUpdate.executedBy[0].orgId };
        this.onOrgSelect(temp);
      } catch (err) { }
    });

  }

  onaddNewGroupbtnclick() {
    $("#imagemodalGroup").modal("show");
    this.apiService.callGetService(`getLookupMasterData?types=grade`).subscribe((res) => {
      this.gradeListDropdownValues = res.data.grades;
    });
  }

  closeNewGroupPopUp() {
    $("#imagemodalGroup").modal("hide");
  }

  onaddNewCatbtnclick() {
    $("#imagemodal").modal("show");
  }

  closeNewCatPopUp() {
    $("#imagemodal").modal("hide");
  }

  saveNewCategory() {
    let rowData: any = [];
    this.catGridApi.forEachNode((node: any) => rowData.push(node.data));
    rowData.push({
      "id": undefined,
      "catName": this.eventCategoriesFormGroup.value.newCatName,
      "catDesc": this.eventCategoriesFormGroup.value.newCatDesc,
      "isSelected": true
    })

    this.catGridApi.setRowData(rowData);
    this.catGridApi.forEachNode(
      (node: any) => {
        if (node.data.isSelected !== null)
          node.setSelected(node.data.isSelected)
      });
    $("#imagemodal").modal("hide");
  }

  saveNewGroup() {
    let rowData: any = [];
    this.groupsGridApi.forEachNode((node: any) => rowData.push(node.data));
    rowData.push({
      "gradeGroupId": undefined,
      "gradeGroupName": this.eventGroupsFormGroup.value.newGroupName,
      "grades": this.eventGroupsFormGroup.value.newGradeList,
      "isSelected": true
    });

    this.groupsGridApi.setRowData(rowData);
    this.groupsGridApi.forEachNode(
      (node: any) => {
        if (node.data.isSelected !== null)
          node.setSelected(node.data.isSelected)
      });
    $("#imagemodalGroup").modal("hide");
  }


  getColDefCat() {
    return this.columnDefsCat = [
      { headerName: 'Category', field: 'catName', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true },
      { headerName: 'Description', field: 'catDesc', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true }
    ];
  }

  getColDefGroups() {
    return this.columnDefsGroup = [
      { headerName: 'Group Name', field: 'gradeGroupName', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true },
      { headerName: 'Grades', field: 'grades', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true }
    ];
  }

  getColDefVenues() {
    return this.columnDefsVenues = [
      { headerName: 'Venue Name', field: 'venueName', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true },
      { headerName: 'Address', field: 'addressLine1', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'Country', field: 'country', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'City', field: 'city', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'Postal Code', field: 'postalCode', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true }
    ];
  }

  onCatGridReady(params: any) {
    this.catGridApi = params.api;

  }

  onGroupsGridReady(params: any) {
    this.groupsGridApi = params.api;
  }

  onVenuesGridReady(params: any) {
    this.venuesGridApi = params.api;
  }

  onRegionSelect(item: any) {
    this.apiService.callGetService(`getRegionWiseJudges?regionId=${item.regionId}`).subscribe((res) => {
      this.judgesDropdownValues = res.data.judges;
    });

  }








  ngOnInit(): void {

    // For getting data of selected row from grid 
    if (this.eventDataService.getSelectedRowData() != undefined) {
      this.selectedRowJson = this.eventDataService.getSelectedRowData();
      this.eventId = this.selectedRowJson.event_Id;
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson))
    }

    // For Label And button Show update
    if (this.selectedRowJson.event_Id != undefined || this.selectedRowJson.event_Id != null) {
      this.eventFormLabel = true; // update screen
    }
    else {
      this.eventFormLabel = false; // insert screen
    }

    this.gridOptionsCat = {
      columnDefs: this.getColDefCat(),
      rowData: this.rowDataCat,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };

    this.gridOptionsGroups = {
      columnDefs: this.getColDefGroups(),
      rowData: this.rowDataGroups,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    }

    this.gridOptionsVenues = {
      columnDefs: this.getColDefVenues(),
      rowData: this.rowDataVenues,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    }


    this.dropdownSettingsGradeList = this.dropdownSettingForGardeList;
    this.dropdownSettingsGroups = this.dropdownSettingForGroups;
    this.dropdownSettingsProctor = this.dropdownSettingForProctor;
    this.dropdownSettingsRegion = this.dropdownSettingForRegion;
    this.dropdownSettingsJudges = this.dropdownSettingForJudges;
    this.dropdownSettingsResponseType = this.dropdownSettingForResponseType;
    this.dropdownSettingsEvaluator = this.dropdownSettingForEvaluators;
    this.dropdownSettingsEventType = this.dropdownSettingForEventType;
    this.dropdownSettingsEventCoordinator = this.dropdownSettingsForEventCoordinator;
    this.dropdownSettingsEventLevel = this.dropdownSettingsForEventLevel;
    this.dropdownSettingsEventExecutedBy = this.dropdownSettingsForEventExecutedBy;

    this.dropdownSettingsEvaluatorDropdownValues = this.dropdownSettingsForEvaluatorDropdownValues;


    this.eventsDataFormGroup = this.formBuilder.group({
      eventId: '',
      name: new FormControl('', Validators.required),
      eventType: new FormControl('', Validators.required),
      eventCoordinator: new FormControl('', Validators.required),
      orgType: new FormControl('', Validators.required),
      orgId: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      registrationStartDate: new FormControl(''),
      registrationEndDate: new FormControl(''),
      eventUrl: new FormControl(''), //, [Validators.required, Validators.pattern(this.myreg)]
      description: new FormControl('', Validators.required),
      sectionCode: (''),
      documents: ('')
    });

    this.eventCategoriesFormGroup = this.formBuilder.group({
      newCatName: new FormControl(''),
      newCatDesc: new FormControl('')
    });

    this.eventGroupsFormGroup = this.formBuilder.group({
      newGroupName: new FormControl(''),
      newGradeList: new FormControl('')
    });

    this.eventCatGroupMapFormGroup = this.formBuilder.group({
      eventCatGroupMapFormArray: this.formBuilder.array([this.addEventCatGroupMap()])
    });

    this.eventVenueAssignFormGroup = this.formBuilder.group({

    });

    this.eventProctorAssignFormGroup = this.formBuilder.group({
      eventProctorAssignFormArray: this.formBuilder.array([this.addProctorAssign()])
    });

    this.eventJudgeAssignFormGroup = this.formBuilder.group({
      categories: this.formBuilder.array([])
    });

    this.questionnaireDataFormGroup = this.formBuilder.group({
      questionnaire: this.formBuilder.array([this.adduserquestionary()])
    });

    this.eventEvaluatorAssignFormGroup = this.formBuilder.group({
      evaluators: new FormControl(''),
    });

    this.eventGradeEvalAssignFormGroup = this.formBuilder.group({
      gradeEvalFormArray: this.formBuilder.array([this.addGradeEval()])
    });



    this.alluserdata = this.uiCommonUtils.getUserMetaDataJson();
    this.orgId = this.alluserdata.orgId;
    this.userId = this.alluserdata.userId;


    this.venuesDataFormGroup = this.formBuilder.group({
      venues: this.formBuilder.array([this.adduserVenuAndProcter()])
    });

    // For getting event data by event id 
    this.apiService.callGetService(`getEvent?id=${this.selectedRowJson.event_Id}`).subscribe((res) => {
      console.log("event Id data : " + res.data.eventData);
      this.eventsDataUpdate = res.data.eventData;
      this.getData();
      this.eventType = this.eventsDataUpdate.eventType;
      this.eventTypeSelChange();



      // For binding data on update screen
      if (this.selectedRowJson.event_Id != undefined || this.selectedRowJson.event_Id != null) {
        console.log("Patch Values event_Id = " + this.selectedRowJson.event_Id);


        let payloadeventCoordinator: any = {};
        let eventCoordinatorArray = [];
        for (let row of this.eventsDataUpdate.coordinators) {
          payloadeventCoordinator = {
            "userId": row.id,
            "name": row.name
          }
          eventCoordinatorArray.push(payloadeventCoordinator);
        }

        let payloadOrgId: any = {};
        let orgIdArray = [];
        for (let row of this.eventsDataUpdate.executedBy) {
          payloadOrgId = {
            "id": row.orgId,
            "name": row.orgName
          }
          orgIdArray.push(payloadOrgId);
        }

        this.eventsDataFormGroup.patchValue({
          eventId: this.eventsDataUpdate.eventId,
          name: this.eventsDataUpdate.name,
          eventType: [this.eventsDataUpdate.eventType],
          eventCoordinator: eventCoordinatorArray, // array
          orgType: [this.eventsDataUpdate.orgType],
          orgId: orgIdArray, // array
          startDate: this.eventsDataUpdate.startDate,
          endDate: this.eventsDataUpdate.endDate,
          registrationStartDate: this.eventsDataUpdate.registrationStartDate,
          registrationEndDate: this.eventsDataUpdate.registrationEndDate,
          eventUrl: this.eventsDataUpdate.eventUrl,
          description: this.eventsDataUpdate.description
        });

      }

      // For Label And button Show update
      if (this.selectedRowJson.event_Id != undefined || this.selectedRowJson.event_Id != null) {
        this.eventFormLabel = true; // update screen
      }
      else {
        this.eventFormLabel = false; // insert screen
      }
      this.selectedRowJson.event_Id = null;

      if (this.eventFormLabel == true) {
        this.evntTypedisabled = true;
      }
      else {
        this.evntTypedisabled = false;
      }

    });
  }


  //miscellaneous
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  // For relational dropdown ie. orgId and orgType
  onOrgSelect(event: any) {
    console.log(event);

    this.selectedOrg = event.orgtype;

    let orgIndex = event.id;
    if (orgIndex == undefined)
      orgIndex = 0;
    else
      orgIndex = parseInt(orgIndex)
    console.log("Dropdown Index:", orgIndex);

    for (let i = 0; i < this.orgs.length; i++) {
      if (this.orgs[i].orgtype == this.selectedOrg) {
        this.orgDetails = this.orgs[i].details;
      }
    }
  }




  createUpdateEvents(payload: any) {

    this.apiService.callPostService('insertEvents', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        this.eventId = res.data.eventId;

        if (this.eventId) {
          this.apiService.uploadfiles(`uploadfile?eventId=${this.eventId}`, this.formData).subscribe((res: any) => {
            if (res.data.status == "success") {
              console.log("success");
            }
            else {
              console.log("failed");
            }
          });
        }

        if (res.data.event_categories) {
          //this.rowDataCat = res.data.event_categories;

          this.catGridApi.setRowData(res.data.event_categories);
          this.catGridApi.forEachNode(
            (node: any) => {
              if (node.data.isSelected !== null)
                node.setSelected(node.data.isSelected)
            });

        }
        if (res.data.event_groups) {
          //this.rowDataGroups = res.data.event_groups;

          this.groupsGridApi.setRowData(res.data.event_groups);

          this.groupsGridApi.forEachNode(
            (node: any) => {
              if (node.data.isSelected !== null)
                node.setSelected(node.data.isSelected)
            });

        }
        if (res.data.eventCatGroupMap) {
          this.eventCatGroupMapdata = res.data.eventCatGroupMap.categoryMapping;
          this.groupsDropdownValues = res.data.eventCatGroupMap.gradeGroupMapping;
          this.eventCatGroupMapFormGroup.setControl('eventCatGroupMapFormArray', this.setEventCatGroupMap(this.eventCatGroupMapdata)); //[i].eventName
          //res.data.eventCatGroupMap.categoryMapping.mappedGroups;
        }
        if (res.data.event_venue_assignment) {
          //this.rowDataVenues = res.data.event_venue_assignment;

          this.venuesGridApi.setRowData(res.data.event_venue_assignment);

          this.venuesGridApi.forEachNode(
            (node: any) => {
              if (node.data.isSelected !== null)
                node.setSelected(node.data.isSelected)
            });


        }
        if (res.data.event_proctor_assignment) {
          this.proctorDropdownValues = res.data.event_proctor_assignment.proctorList;
          this.venueListData = res.data.event_proctor_assignment.venueList;

          let formattedDataVenueListData: any = [];

          for (let row of this.venueListData) {
            let json = {
              "venueId": row.venueId,
              "venueName": row.venueName,
              "mappedProctor": [
                {
                  "name": row.mappedProctor.name,
                  "proctorId": row.mappedProctor.proctorId
                }
              ],
              "eventVenueMapId": row.eventVenueMapId
            }
            formattedDataVenueListData.push(json);
          }

          this.eventProctorAssignFormGroup.setControl('eventProctorAssignFormArray', this.setProctorAssign(formattedDataVenueListData));
        }
        if (res.data.event_judge_assignment) {

          this.selectedCategories = res.data.event_judge_assignment.categoriesList;
          if (this.eventFormLabel == false) { // create event screen
            this.eventJudgeAssignFormGroup.setControl('categories', this.setEventCategory(this.selectedCategories));
          }
          this.regionDropdownValues = res.data.event_judge_assignment.regionsList;
          if (this.eventFormLabel == true) {  // update screen     
            if (res.data.event_judge_assignment.categories.length != 0) {
              this.categories().clear();
              this.patchValueJudgesAssign(res.data.event_judge_assignment);
            }
            else {
              this.eventJudgeAssignFormGroup.setControl('categories', this.setEventCategory(this.selectedCategories));
            }
          }
        }
        if (res.data.event_questionnaires) {
          this.responseTypeDropdownValues = res.data.event_questionnaires.answerTypes;

          this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionaireData(res.data.event_questionnaires.questionnaire));

        }

        if (res.data.event_evaluator_assignment) {
          this.evaluatorDropdownValues = res.data.event_evaluator_assignment;

          if (this.eventFormLabel == true) {  // update screen

            let mappedEvaluators = [];

            for (let row of this.evaluatorDropdownValues) {
              if (row.isSelected == true) {
                let json = {
                  "evalId": row.evalId,
                  "evalName": row.evalName,
                  "eventEvaluatorId": row.eventEvaluatorId
                }
                mappedEvaluators.push(json);
              }
            }
            this.selectedEvaluatorsDropdown = mappedEvaluators;

          }
        }

        if (res.data.event_grade_evaluator_assignment) {
          let mappedEvaluator: any = [];
          this.gradeEvaluatorAssignmentData = res.data.event_grade_evaluator_assignment;
          for (let row of res.data.event_grade_evaluator_assignment.allData) {
            if (row.userId != null) {
              let tempjson = {
                "grade": row.grade,
                "gradeOrgId": row.gradeOrgId,
                "name": row.name,
                "userId": row.userId
              }
              let result = mappedEvaluator.findIndex((item: any) => item.grade === row.grade);
              if (result == -1) {
                mappedEvaluator.push(tempjson);
              }
            }
          }


          let gradesEvaluatorsMappingData = [];

          for (let row of this.gradeEvaluatorAssignmentData.gradesData) {

            let result = mappedEvaluator.findIndex((item: any) => item.grade === row.grade);
            if (result >= 0) {
              for (let row1 of mappedEvaluator) {
                let gardesJson = {
                  "grade": row.grade,
                  "gradeOrgId": row.gradeOrgId,
                  "evaluator": [
                    {
                      "userId": row1.userId,
                      "name": row1.name
                    }
                  ]
                }
                if (row1.grade == row.grade) {
                  gradesEvaluatorsMappingData.push(gardesJson);
                }
              }

            }
            else {
              let gardesJson = {
                "grade": row.grade,
                "gradeOrgId": row.gradeOrgId,
                "evaluator": [
                  {
                    "userId": null,
                    "name": null
                  }
                ]
              }
              gradesEvaluatorsMappingData.push(gardesJson);

            }

          }

          console.log("gradesEvaluatorsMappingData", gradesEvaluatorsMappingData);


          let teachersGradesData = [];
          for (let row1 of gradesEvaluatorsMappingData) {
            let index = this.gradeEvaluatorAssignmentData.selectedTeachersData.findIndex((item: any) => item.roleId === row1.gradeOrgId && item.roleId !== 0);

            if (index !== -1) {
              teachersGradesData.push({
                "grade": row1.grade,
                "gradeOrgId": row1.gradeOrgId,
                "evaluator": [
                  {
                    "userId": this.gradeEvaluatorAssignmentData.selectedTeachersData[index].userId,
                    "name": this.gradeEvaluatorAssignmentData.selectedTeachersData[index].name
                  }
                ]
              });
            }
            else {
              teachersGradesData.push({
                "grade": row1.grade,
                "gradeOrgId": row1.gradeOrgId,
                "evaluator": [row1.evaluator]
              });
            }
          }



          if (this.eventFormLabel == true) {
            this.eventGradeEvalAssignFormGroup.setControl('gradeEvalFormArray', this.setGradeEval(teachersGradesData));
          } // update screen
          else {
            this.eventGradeEvalAssignFormGroup.setControl('gradeEvalFormArray', this.setGradeEval(gradesEvaluatorsMappingData));
          }



          this.gradewiseEvaluatorDropdownValues = res.data.event_grade_evaluator_assignment.teachersData;

        }

      }
      else if (res.data.status == "eventAlreadyExists") {
        this.uiCommonUtils.showSnackBar("This type of event already exists for current term!", "error", 3000);
      }
      else
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
    });
  }


  fnRegionDropdownValues(region: any): any {

    try {
      for (let reg of this.regionDropdownValues) {
        if (reg.regionId == region.value.regions[0].regionId) {
          return reg.judges;
        }
      }

    } catch (error) {
      return [];
    }
  }

  eventTypeSelChange() {


    if (this.eventFormLabel == false) {  // insert screen
      if (this.eventsDataFormGroup.value.eventType[0].eventType) {
        this.eventType = this.eventsDataFormGroup.value.eventType[0].eventType;
      }
    }

    //for getting event co ordinator as per event type
    if (this.eventType == 'CWC') {
      this.rolesData = ['CWC Coordinator'];
      let roleData =
      {
        "data": {
          "rolesData": this.rolesData
        }
      }
      this.apiService.getProctorData(roleData).subscribe(res => {
        this.proctorData = res.data.metaData.proctorData;
        console.log("this.proctorData", this.proctorData);
      });
    }

    if (this.eventType == 'TTC') {
      this.rolesData = ['TTC Exam Coordinator'];
      let roleData =
      {
        "data": {
          "rolesData": this.rolesData
        }
      }
      this.apiService.getProctorData(roleData).subscribe(res => {
        this.proctorData = res.data.metaData.proctorData;
        console.log("this.proctorData", this.proctorData);
      });
    }

    if (this.eventType == 'OVBS') {
      this.rolesData = ['OVBS Coordinator'];
      let roleData =
      {
        "data": {
          "rolesData": this.rolesData
        }
      }
      this.apiService.getProctorData(roleData).subscribe(res => {
        this.proctorData = res.data.metaData.proctorData;
        console.log("this.proctorData", this.proctorData);
      });
    }

    if (this.eventType == 'Diploma Exam') {
      this.rolesData = ['Diploma Exam Coordinator'];
      let roleData =
      {
        "data": {
          "rolesData": this.rolesData
        }
      }
      this.apiService.getProctorData(roleData).subscribe(res => {
        this.proctorData = res.data.metaData.proctorData;
        console.log("this.proctorData", this.proctorData);
      });
    }



    if (this.eventType == 'Talent Competition') {
      this.rolesData = ['Regional Talent Competition Coordinator'];
      let roleData =
      {
        "data": {
          "rolesData": this.rolesData
        }
      }
      this.apiService.getProctorData(roleData).subscribe(res => {
        this.proctorData = res.data.metaData.proctorData;
        console.log("this.proctorData", this.proctorData);
      });
    }


    if (this.eventType == 'Sunday School Midterm Exam') {
      this.rolesData = ['Sunday School Event Coordinator'];
      let roleData =
      {
        "data": {
          "rolesData": this.rolesData
        }
      }
      this.apiService.getProctorData(roleData).subscribe(res => {
        this.proctorData = res.data.metaData.proctorData;
        console.log("this.proctorData", this.proctorData);
      });
    }


    if (this.eventType == 'Sunday School Final Exam') {
      this.rolesData = ['Sunday School Event Coordinator'];
      let roleData =
      {
        "data": {
          "rolesData": this.rolesData
        }
      }
      this.apiService.getProctorData(roleData).subscribe(res => {
        this.proctorData = res.data.metaData.proctorData;
        console.log("this.proctorData", this.proctorData);
      });
    }



    this.getData();

    if (this.eventType == 'Diploma Exam' || this.eventType == 'Sunday School Final Exam' || this.eventType == 'Sunday School Midterm Exam') {
      this.isEvalSecNextButtonRequired = false;
    }
    else {
      this.isEvalSecNextButtonRequired = true;
    }


  }

  onEventDetailsSectionNextBtnClick() {


    if (this.eventsDataFormGroup.valid) {

      // For getting Proctor data as per rolesdata
      if (this.eventType == 'CWC') {
        this.rolesData = ['CWC Competition Proctor', 'CWC Coordinator'];
        let roleData =
        {
          "data": {
            "rolesData": this.rolesData
          }
        }
        this.apiService.getProctorData(roleData).subscribe(res => {
          this.proctorData = res.data.metaData.proctorData;
          console.log("this.proctorData", this.proctorData);
        });
      }

      if (this.eventType == 'TTC') {
        this.rolesData = ['TTC Exam Proctor', 'TTC Exam Coordinator'];
        let roleData =
        {
          "data": {
            "rolesData": this.rolesData
          }
        }
        this.apiService.getProctorData(roleData).subscribe(res => {
          this.proctorData = res.data.metaData.proctorData;
          console.log("this.proctorData", this.proctorData);
        });
      }

      if (this.eventType == 'OVBS') {
        this.rolesData = ['OVBS Coordinator'];
        let roleData =
        {
          "data": {
            "rolesData": this.rolesData
          }
        }
        this.apiService.getProctorData(roleData).subscribe(res => {
          this.proctorData = res.data.metaData.proctorData;
          console.log("this.proctorData", this.proctorData);
        });
      }


      // For getting Venues as per orgType and orgId
      let venuesDatanew: any = {};

      venuesDatanew.orgType = this.eventsDataFormGroup.value.orgType;
      venuesDatanew.orgId = this.eventsDataFormGroup.value.orgId;

      this.apiService.getVenues({ data: venuesDatanew }).subscribe((res: any) => {
        this.venuesList = res.data.venueList;
        console.log("venuesList", this.venuesList);
      });


    }


    let eventCoordinator: any = [];
    let orgId: any = [];

    for (let row of this.eventsDataFormGroup.value.eventCoordinator) {
      eventCoordinator.push(row.userId);
    }

    for (let row of this.eventsDataFormGroup.value.orgId) {
      orgId.push(row.id);
    }


    if (this.eventsDataFormGroup.value.orgType[0].orgtype) {
      this.eventsDataFormGroup.value.orgType = this.eventsDataFormGroup.value.orgType[0].orgtype;
    }

    let payload: any = {
      "eventId": this.eventId,
      "name": this.eventsDataFormGroup.value.name,
      "eventType": this.eventType,
      "eventCoordinator": eventCoordinator,
      "orgType": this.eventsDataFormGroup.value.orgType,
      "orgId": orgId,
      "startDate": this.eventsDataFormGroup.value.startDate,
      "endDate": this.eventsDataFormGroup.value.endDate,
      "registrationStartDate": this.eventsDataFormGroup.value.registrationStartDate,
      "registrationEndDate": this.eventsDataFormGroup.value.registrationEndDate,
      "eventUrl": this.eventsDataFormGroup.value.eventUrl,
      "description": this.eventsDataFormGroup.value.description
    }



    //create/update event for CWC for event_details section
    if (this.eventType == 'CWC' || this.eventType == 'Talent Competition' || this.eventType == 'Talent Show') {
      if (this.isSingleDayEvent == true) {
        this.eventsDataFormGroup.value.endDate = this.eventsDataFormGroup.value.startDate;
        payload.endDate = this.eventsDataFormGroup.value.endDate;
      }
      payload.sectionCode = 'event_details';
      payload.nextSectionCode = 'event_categories';
      this.createUpdateEvents(payload);
    }

    if (this.eventType == 'TTC' || this.eventType == 'Teachers Training') {
      if (this.isSingleDayEvent == true) {
        this.eventsDataFormGroup.value.endDate = this.eventsDataFormGroup.value.startDate;
        payload.endDate = this.eventsDataFormGroup.value.endDate;
      }
      payload.sectionCode = 'event_details';
      payload.nextSectionCode = 'event_venue_assignment';
      this.createUpdateEvents(payload);
    }

    if (this.eventType == 'Bible Reading' || this.eventType == 'Diploma Exam' || this.eventType == 'OVBS' || this.eventType == 'Sunday School Final Exam' || this.eventType == 'Sunday School Midterm Exam') {
      if (this.isSingleDayEvent == true) {
        this.eventsDataFormGroup.value.endDate = this.eventsDataFormGroup.value.startDate;
        payload.endDate = this.eventsDataFormGroup.value.endDate;
      }
      payload.sectionCode = 'event_details';
      payload.nextSectionCode = 'event_venue_assignment';
      this.createUpdateEvents(payload);
    }

  }

  onEventCategoriesSectionNextBtn() {

    let categories = this.catGridApi.getSelectedRows();

    //create/update event for CWC
    if (this.eventType == 'CWC' || this.eventType == 'Talent Competition' || this.eventType == 'Talent Show') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      let payload: any = {};
      payload.categories = categories;
      payload.sectionCode = 'event_categories';
      payload.nextSectionCode = 'event_groups';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }


  }

  onEventGroupsSectionNextBtn() {
    let groups = this.groupsGridApi.getSelectedRows();

    //create/update event for CWC 
    if (this.eventType == 'CWC' || this.eventType == 'Talent Competition' || this.eventType == 'Talent Show') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      let payload: any = {};
      payload.groups = groups;
      payload.sectionCode = 'event_groups';
      payload.nextSectionCode = 'event_cat_group_map';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }

  }

  onEventCatGroupMapSectionNextBtn() {

    if (this.eventType == 'CWC' || this.eventType == 'Talent Competition' || this.eventType == 'Talent Show') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      let payload: any = {};
      payload.catGradeMap = this.eventCatGroupMapFormGroup.value.eventCatGroupMapFormArray;
      payload.sectionCode = 'event_cat_group_map';
      payload.nextSectionCode = 'event_venue_assignment';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }

  }

  onEventVenueAssignSectionNextBtn() {

    let allVenuesData = this.venuesGridApi.getSelectedRows();
    let venues: any = [];
    for (let venue of allVenuesData) {
      venues.push(venue.venueId);
    }


    //create/update event for CWC 
    if (this.eventType == 'CWC' || this.eventType == 'Talent Competition' || this.eventType == 'Talent Show') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      let payload: any = {};
      payload.venues = venues;
      payload.sectionCode = 'event_venue_assignment';
      payload.nextSectionCode = 'event_proctor_assignment';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }


    if (this.eventType == 'TTC' || this.eventType == 'Diploma Exam' || this.eventType == 'Sunday School Final Exam' || this.eventType == 'Sunday School Midterm Exam') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      let payload: any = {};
      payload.venues = venues;
      payload.sectionCode = 'event_venue_assignment';
      payload.nextSectionCode = 'event_proctor_assignment';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }

    if (this.eventType == 'Bible Reading' || this.eventType == 'OVBS' || this.eventType == 'Teachers Training') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      let payload: any = {};
      payload.venues = venues;
      payload.sectionCode = 'event_venue_assignment';
      payload.nextSectionCode = 'event_questionnaires';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }

  }

  onEventProctorAssignSectionNextBtn() {

    let payload: any = {};
    let venueProctorAssignment: any = [];
    let allVenueProctorData = this.eventProctorAssignFormGroup.value.eventProctorAssignFormArray;

    for (let data of allVenueProctorData) {
      let json: any = {};
      if (data.proctorId) {
        json = {
          "eventVenueMapId": data.eventVenueMapId,
          "proctorId": data.proctorId[0].proctorId
        }
        venueProctorAssignment.push(json);
      }
    }


    if (this.eventType == 'CWC' || this.eventType == 'Talent Competition') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payload.venueProctorAssignment = venueProctorAssignment;
      payload.sectionCode = 'event_proctor_assignment';
      payload.nextSectionCode = 'event_judge_assignment';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }

    if (this.eventType == 'TTC' || this.eventType == 'Diploma Exam') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payload.venueProctorAssignment = venueProctorAssignment;
      payload.sectionCode = 'event_proctor_assignment';
      payload.nextSectionCode = 'event_evaluator_assignment';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }


    let orgId: any = [];
    for (let row of this.eventsDataFormGroup.value.orgId) {
      orgId.push(row.id);
    }

    if (this.eventType == 'Sunday School Final Exam' || this.eventType == 'Sunday School Midterm Exam') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payload.venueProctorAssignment = venueProctorAssignment;
      payload.orgId = orgId[0];
      payload.sectionCode = 'event_proctor_assignment';
      payload.nextSectionCode = 'event_grade_evaluator_assignment';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }

    if (this.eventType == 'Talent Show') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payload.venueProctorAssignment = venueProctorAssignment;
      payload.sectionCode = 'event_proctor_assignment';
      payload.nextSectionCode = 'event_questionnaires';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }



  }

  onEventJudgeAssignSectionNextBtn() {

    let json: any = {};
    let payload: any = {};
    let regions: any = [];
    let judges: any = [];
    let judgeAssignment: any = [];
    let judgeAssignmentAllData = this.eventJudgeAssignFormGroup.value.categories;



    for (let data of judgeAssignmentAllData) {
      for (let row of data.regionsJudgesArray) {
        for (let data1 of row.judges) {
          judges.push(data1.judgeId);
        }

        for (let data2 of row.regions) {

          regions.push({
            "regionId": data2.regionId,
            "judges": judges
          });

          if (data.catId == json.catId) {
            json.regions.push(regions[0]);
            regions = [];
          }
          else {
            json = {
              "catId": data.catId,
              "catMapId": data.catMapId,
              "regions": regions
            }
            judgeAssignment.push(json);
            regions = [];
          }

          judges = [];

        }

      }

    }


    if (this.eventType == 'CWC' || this.eventType == 'Talent Competition') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payload.judgeAssignment = judgeAssignment;
      payload.sectionCode = 'event_judge_assignment';
      payload.nextSectionCode = 'event_questionnaires';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }

  }

  onEventEvaluatorAssignSectionNextBtn() {

    let payload: any = {};
    let evaluatorAssignment = this.eventEvaluatorAssignFormGroup.value.evaluators;

    if (this.eventType == 'TTC' || this.eventType == 'Sunday School Final Exam' || this.eventType == 'Sunday School Midterm Exam') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payload.evaluatorAssignment = evaluatorAssignment;
      payload.sectionCode = 'event_evaluator_assignment';
      payload.nextSectionCode = 'event_questionnaires';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
    }
  }

  createEvent() {

    let payload: any = {};
    let questionnaire: any = [];
    let questionnaireAllData = this.questionnaireDataFormGroup.value.questionnaire;

    for (let row of questionnaireAllData) {
      let json = {
        "questionId": row.questionId,
        "question": row.question,
        "answerType": row.responseType
      }
      questionnaire.push(json);
    }



    if (this.eventType == 'CWC' || this.eventType == 'TTC' || this.eventType == 'Bible Reading' || this.eventType == 'OVBS' || this.eventType == 'Talent Competition' || this.eventType == 'Talent Show') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payload.questionnaire = questionnaire;
      payload.sectionCode = 'event_questionnaires';
      payload.eventType = this.eventType;
      payload.eventId = this.eventId;
      this.createUpdateEvents(payload);
      this.uiCommonUtils.showSnackBar("Saved successfully!", "success", 3000);
    }


    let payloadEval: any = {};
    let evaluatorAssignment = this.eventEvaluatorAssignFormGroup.value.evaluators;

    if (this.eventType == 'Diploma Exam') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payloadEval.evaluatorAssignment = evaluatorAssignment;
      payloadEval.sectionCode = 'event_evaluator_assignment';
      payloadEval.nextSectionCode = 'event_questionnaires';
      payloadEval.eventType = this.eventType;
      payloadEval.eventId = this.eventId;
      this.createUpdateEvents(payloadEval);
      this.uiCommonUtils.showSnackBar("Saved successfully!", "success", 3000);
    }


    let payloadGradeEval: any = {};
    let gradeEvalAssign = this.eventGradeEvalAssignFormGroup.value.gradeEvalFormArray;
    if (this.eventType == 'Sunday School Final Exam' || this.eventType == 'Sunday School Midterm Exam') {
      this.eventsDataFormGroup.value.eventId = this.eventId;
      payloadGradeEval.gradeEvalAssign = gradeEvalAssign;
      payloadGradeEval.sectionCode = 'event_grade_evaluator_assignment';
      payloadGradeEval.nextSectionCode = 'event_questionnaires';
      payloadGradeEval.eventType = this.eventType;
      payloadGradeEval.eventId = this.eventId;
      this.createUpdateEvents(payloadGradeEval);
      this.uiCommonUtils.showSnackBar("Saved successfully!", "success", 3000);
      console.log("payloadGradeEval", payloadGradeEval);
    }


  }










  onaddbtnclick() {
    this.venues = this.venuesDataFormGroup.get('venues') as FormArray;
    this.venues.push(this.adduserVenuAndProcter());
  }

  onaddbtnclick1() {
    this.questionnaire = this.questionnaireDataFormGroup.get('questionnaire') as FormArray;
    this.questionnaire.push(this.adduserquestionary());
  }

  onremovebtnclickVenu(index: any) {
    (<FormArray>this.venuesDataFormGroup.get('venues').removeAt(index));
  }

  onremovebtnclickQuestion(index: any) {
    (<FormArray>this.questionnaireDataFormGroup.get('questionnaire').removeAt(index));
  }

  removeEventCategory(index: any) {
    //(<FormArray>this.eventCategoriesFormGroup.get('categories').removeAt(index));
  }

  addRegionAndJudges(regIndex: number) {
    this.regionsAndJudges(regIndex).push(this.newRegionsAndJudges());
  }

  removeRegionsAndJudges(i: number, regIndex: number) {
    this.regionsAndJudges(i).removeAt(regIndex);
  }

  onCloseBtnClick() {
    this.router.navigate(['/dashboard/events/']);
  }


  categories(): FormArray {
    return this.eventJudgeAssignFormGroup.get('categories') as FormArray;
  }

  newCategories(): FormGroup {
    return this.formBuilder.group({
      catId: '',
      categoryName: '',
      catMapId: '',
      regionsJudgesArray: this.formBuilder.array([])
    });
  }

  newRegionsAndJudges(): FormGroup {
    return this.formBuilder.group({
      regions: '',
      judges: ''
    });
  }


  regionsAndJudges(i: number): FormArray {
    return this.categories()
      .at(i)
      .get('regionsJudgesArray') as FormArray;
  }


  patchValueJudgesAssign(data: any) {



    data.categories.forEach((t: any) => {

      var category: FormGroup = this.newCategories();
      this.categories().push(category);

      t.regionsJudgesArray.forEach((b: any) => {
        var region = this.newRegionsAndJudges();

        (category.get("regionsJudgesArray") as FormArray).push(region)

      });
    });

    //this.onRegionSelect({ regionId: data.categories[0].regionsJudgesArray[0].regions[0].regionId });
    // {emitEvent: true, onlySelf: true}
    this.eventJudgeAssignFormGroup.patchValue(data);


  }



  setEventCategory(eventcategorydata: any): FormArray {
    const formArray = new FormArray([]);
    eventcategorydata.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        catId: e.catId,
        categoryName: e.catName,
        catMapId: e.catMapId,
        regionsJudgesArray: this.formBuilder.array([this.newRegionsAndJudges()])
      }));
    });
    return formArray;
  }



  addProctorAssign(): FormGroup {
    return this.formBuilder.group({
      eventVenueMapId: '',
      venueName: '',
      proctorId: ''
    });
  }

  addGradeEval(): FormGroup {
    return this.formBuilder.group({
      grade: '',
      gradeOrgId: '',
      evaluator: '',
    });
  };


  addEventCatGroupMap(): FormGroup {
    return this.formBuilder.group({
      catMapId: '',
      categoryName: '',
      groupMapIds: ''
    });
  }

  adduserquestionary(): FormGroup {
    return this.formBuilder.group({
      questionId: '',
      question: '',
      responseType: '',
    });
  }

  adduserVenuAndProcter(): FormGroup {
    return this.formBuilder.group({
      venueId: '',
      proctorId: '',
      eventVenueId: ''
    });
  }

  addeventCategory(): FormGroup {
    return this.formBuilder.group({
      eventCategoryID: '',
      name: '',
      schoolGradeFrom: '',
      schoolGradeTo: '',
      judges: '',
      venueId: '',
      eventCatMapId: ''
    });
  }


  setQuestionaireData(questionaireData: any): FormArray {
    const formArray = new FormArray([]);
    questionaireData.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        questionId: e.questionId,
        question: e.question,
        responseType: [e.answerType]
      }));
    });
    return formArray;
  }

  setEventCatGroupMap(eventCatGroupMapdata: any): FormArray {
    const formArray = new FormArray([]);
    eventCatGroupMapdata.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        catMapId: e.catMapId,
        categoryName: e.catName,
        groupMapIds: [e.mappedGroups]
      }));
    });
    return formArray;
  }

  setGradeEval(eventGradeEvaldata: any): FormArray {
    const formArray = new FormArray([]);
    eventGradeEvaldata.forEach((e: any) => {
      if (e.evaluator[0].name != null) {
        formArray.push(this.formBuilder.group({
          grade: e.grade,
          gradeOrgId: e.gradeOrgId,
          evaluator: [e.evaluator]
        }));
      }
      else {
        formArray.push(this.formBuilder.group({
          grade: e.grade,
          gradeOrgId: e.gradeOrgId,
          evaluator: ''
        }));
      }

    });
    return formArray;
  }


  setProctorAssign(eventProctorAssigndata: any): FormArray {
    const formArray = new FormArray([]);
    eventProctorAssigndata.forEach((e: any) => {

      if (e.mappedProctor[0].name != null) {
        formArray.push(this.formBuilder.group({
          eventVenueMapId: e.eventVenueMapId,
          venueName: e.venueName,
          proctorId: [e.mappedProctor]
        }));
      }
      else {
        formArray.push(this.formBuilder.group({
          eventVenueMapId: e.eventVenueMapId,
          venueName: e.venueName,
          proctorId: ''
        }));
      }
    });
    return formArray;
  }



  handleEventFlyerFileInput(event: any) {
    console.log('file uploaded');
  }



  /////////////////////////////////////////////// Validation Functions ///////////////////////////////////////////////////////////////////


  //Registration End Date Validator that is registrationEndDate>registrationStartDate
  comparisonRegiEnddateValidator(): any {
    let regiStartDate = this.eventsDataFormGroup.value['registrationStartDate'];
    let regiEndDate = this.eventsDataFormGroup.value['registrationEndDate'];

    let startnew = new Date(regiStartDate);
    let endnew = new Date(regiEndDate);

    if (startnew > endnew) {
      return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange': true });
    }


  }
  //Registration Start Date Validator that is registrationStartDate < registrationEndDate
  comparisonRegiStartdatedateValidator(): any {
    let regiStartDate = this.eventsDataFormGroup.value['registrationStartDate'];
    let regiEndDate = this.eventsDataFormGroup.value['registrationEndDate'];

    let startnew = new Date(regiStartDate);
    let endnew = new Date(regiEndDate);
    if (startnew > endnew) {
      return this.eventsDataFormGroup.controls['registrationStartDate'].setErrors({ 'invaliddaterange': true });
    }


  }
  //Event End Date Validator that is endDate>startDate
  comparisonEventEnddateValidator(): any {

    let startDate = this.eventsDataFormGroup.value['startDate'];
    let endDate = this.eventsDataFormGroup.value['endDate'];

    if (startDate > endDate) {
      return this.eventsDataFormGroup.controls['endDate'].setErrors({ 'invaliddaterange': true });
    }


  }
  comparisonEventStartdateValidator(): any {

    let startDate = this.eventsDataFormGroup.value['startDate'];
    let endDate = this.eventsDataFormGroup.value['endDate'];

    let eventstartnew = new Date(startDate);
    let eventendnew = new Date(endDate);
    if (eventstartnew > eventendnew) {
      return this.eventsDataFormGroup.controls['startDate'].setErrors({ 'invaliddaterange': true });
    }


  }
  //Event start Date Validator that is EentStartDate>RegistrationEndDate
  comparisonEventStartandRegiEnddateValidator(): any {
    let regiEndDate = this.eventsDataFormGroup.value['registrationEndDate'];
    let startDate = this.eventsDataFormGroup.value['startDate'];


    let eventstartnew = new Date(startDate);
    let regiEndDatenew = new Date(regiEndDate);
    if (regiEndDatenew > eventstartnew) {
      return this.eventsDataFormGroup.controls['startDate'].setErrors({ 'invaliddaterange1': true });
    }


  }
  comparisonRegiEnddateandEventStartValidator(): any {
    let regiEndDate = this.eventsDataFormGroup.value['registrationEndDate'];
    let startDate = this.eventsDataFormGroup.value['startDate'];


    let eventstartnew = new Date(startDate);
    let regiEndDatenew = new Date(regiEndDate);
    if (regiEndDatenew > eventstartnew) {
      return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange2': true });
    }


  }
  //Event start Date Validator that is EentStartDate>RegistrationEndDate
  comparisonEventStartandRegiStartdateValidator(): any {
    let regiStartDate = this.eventsDataFormGroup.value['registrationStartDate'];
    let startDate = this.eventsDataFormGroup.value['startDate'];


    let eventstartnew = new Date(startDate);
    let regiStartDateenew = new Date(regiStartDate);
    if (regiStartDateenew > eventstartnew) {
      return this.eventsDataFormGroup.controls['startDate'].setErrors({ 'invaliddaterange3': true });
    }


  }
  //Event start Date Validator that is EentStartDate>RegistrationEndDate
  comparisontRegiStartdateandEventStarValidator(): any {
    let regiStartDate = this.eventsDataFormGroup.value['registrationStartDate'];
    let startDate = this.eventsDataFormGroup.value['startDate'];


    let eventstartnew = new Date(startDate);
    let regiStartDateenew = new Date(regiStartDate);
    if (regiStartDateenew > eventstartnew) {
      return this.eventsDataFormGroup.controls['registrationStartDate'].setErrors({ 'invaliddaterange4': true });
    }


  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  onVenuesNextBtnClick() {
    this.venues = this.venuesDataFormGroup.get('venues') as FormArray;
    this.newVenues = this.venues.value;

    for (let i = 0; i < this.venuesList.length; i++) {
      console.log(this.venuesList[i].name);
      console.log(this.venuesList[i].venueId);
      for (let j = 0; j < this.newVenues.length; j++) {
        if (this.newVenues[j].venueId == this.venuesList[i].venueId) {
          this.newVenues[j].venueName = this.venuesList[i].venueName;
        }
      }
    }

    if (this.venuesDataFormGroup.value.venues.length == 0) {
      this.uiCommonUtils.showSnackBar("Event should atleast have one venue!", "error", 3000);
    }

  }




}
