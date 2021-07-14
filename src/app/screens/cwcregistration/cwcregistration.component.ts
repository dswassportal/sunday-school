import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { EventCreationComponent } from '../event-creation/event-creation.component';
import { uiCommonUtils } from '../../common/uiCommonUtils';
import * as moment from 'moment';
import { Moment } from 'moment';
import { EventRegistrationDataService } from '../event-registration/event.registrationDataService';
import { Router } from '@angular/router';
declare let $: any;
import { DatePickerRendererComponent } from '../renderers/date-picker-renderer/date-picker-renderer.component'
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-cwcregistration',
  templateUrl: './cwcregistration.component.html',
  styleUrls: ['./cwcregistration.component.css']
})
export class CwcregistrationComponent implements OnInit {

  //cwcRegistrationForm: any;
  venuesDataFormGroup: any;
  participantDataFormGroup: any;
  dropdownSettingsVenues: any;
  dropdownSettingsFamilyMembers: any;
  dropdownSettingsRoles: any;
  dropdownSettingsGroup: any;
  venueList: any;
  eventData: any = {};
  participantRoles: any;
  regEndDate: any;
  eventStartDate: any;
  eventCategoriesData: any;
  questionnaireData: any;

  isUpdateBtnRequired: any;
  registrationId: any;
  isCancelRegiBtnRequired: any;
  eventEndDate: any;
  familyMembersData: any;
  isPraticipantNameReadonly: boolean = false;

  isVenueRequired: any;
  isCategoryRequired: any;
  isSchoolGroupRequired: any;
  isQuestionnaireRequired: any;
  isAttachmentRequired: any;
  isSingleDayEvent: any;



  categoriesDataFormGroup: any;
  questionnaireDataFormGroup: any;
  userMetaData: any;
  loggedInUser: any;
  eventQuestionnaireData!: any[];
  answer: any;
  ttcFormGroup: any;
  event: any;
  item: any;
  columnDefs!: any[];
  partIds!: any[];
  rowData: any = [];
  rowDataBinding: any = [];
  isTtcEvent!: boolean;
  eventId: any;
  selectedUserIds: any;
  term: any;
  gridOptions: any;
  startDate: any;
  endDate: any;
  registrationStartDate: any;
  registrationEndDate: any;
  //isParticipant:boolean = false;
  enrollmentId: any;
  showHideEnrollmentId: boolean = false;
  eventCatMapId: any;
  groupData: any;
  isStudent:boolean = true;

  constructor(private router: Router, private apiService: ApiService, private formBuilder: FormBuilder,
    private uiCommonUtils: uiCommonUtils, private eventRegistrationDataService: EventRegistrationDataService) { }

  selected!: { startDate: Moment; endDate: Moment; };
  selectedRowJson: any = {};
  selectedEventType: any = {};
  currentURL = '';
  venuesList!: any[];

  minDate: string = '';
  maxDate: string = '';



  dropdownSettingsForRoles: IDropdownSettings = {
    singleSelection: true,
    idField: 'code',
    textField: 'roleDesc',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForVenues: IDropdownSettings = {
    singleSelection: true,
    idField: 'venueMapId',
    textField: 'venueName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForFamilyMembers: IDropdownSettings = {
    singleSelection: true,
    idField: 'userId',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForGroup : IDropdownSettings = {
    singleSelection: true,
    idField: 'groupId',
    textField: 'groupName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };


  ngOnInit(): void {

    this.currentURL = window.location.href;
    let splitedURL = this.currentURL.split('/');
    this.selectedEventType = splitedURL[splitedURL.length - 1];
    console.log("currentURL is last value: " + this.selectedEventType);


    if (this.eventRegistrationDataService.getSelectedRowData() != undefined) {
      this.selectedRowJson = this.eventRegistrationDataService.getSelectedRowData();
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson));
    }

    if (this.selectedRowJson.event_type == "TTC") {
      this.isTtcEvent = true;
    }
    else {
      this.isTtcEvent = false;
    }


    this.dropdownSettingsFamilyMembers = this.dropdownSettingsForFamilyMembers;
    this.dropdownSettingsVenues = this.dropdownSettingsForVenues;
    this.dropdownSettingsRoles = this.dropdownSettingsForRoles;
    this.dropdownSettingsGroup = this.dropdownSettingsForGroup;

    this.venuesDataFormGroup = this.formBuilder.group({
      venues: new FormControl('')
    });

    this.participantDataFormGroup = this.formBuilder.group({
      participantName: new FormControl(''),
      role: new FormControl(''),
      group: new FormControl('')
    });

    this.questionnaireDataFormGroup = this.formBuilder.group({
      questionnaire: this.formBuilder.array([this.addeventquestionnaire()])
    });

    this.columnDefs = this.getColDef();


    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.eventId = this.selectedRowJson.event_Id;
    this.isStudent = this.userMetaData.isStudent;

    this.registrationStartDate = new Date(this.selectedRowJson.registrationStartDate).toLocaleDateString("en-us");
    this.registrationEndDate = new Date(this.selectedRowJson.registrationEndDate).toLocaleDateString("en-us");
    // let addQParam: boolean = false;
    // console.log("selectedEvent Type :: " + JSON.stringify(this.selectedEventType));
    // if (this.selectedEventType === 'registered_events' || this.selectedEventType === 'completed_events')
    //   addQParam = true;

    let participantIdOrLoggedInUserId: any;
    if (this.selectedRowJson.participantId) {
      participantIdOrLoggedInUserId = this.selectedRowJson.participantId;
    }
    else {
      participantIdOrLoggedInUserId = this.loggedInUser;
    }

    this.apiService.callGetService(`getEventDef?eventId=${this.selectedRowJson.event_Id}&participantId=${participantIdOrLoggedInUserId}`).subscribe((res) => {


      this.isUpdateBtnRequired = false;
      this.eventData = res.data.eventData;
      this.venueList = res.data.eventData.venues;

      this.groupData = this.eventData.gradeGroup;

      this.regEndDate = this.eventData.regEndDate;
      this.eventStartDate = this.eventData.eventStartDate;
      this.eventEndDate = this.eventData.eventEndDate;
      this.regEndDate = new Date(this.regEndDate).toLocaleDateString("en-us");
      this.eventStartDate = new Date(this.eventStartDate).toLocaleDateString("en-us");
      this.eventEndDate = new Date(this.eventEndDate).toLocaleDateString("en-us");

      this.participantRoles = res.data.eventData.participantRoles;
      this.familyMembersData = res.data.eventData.familyMembers;


      this.isVenueRequired = this.eventData.sectionConfig.isVenueRequired;
      this.isCategoryRequired = this.eventData.sectionConfig.isCategoryRequired;
      this.isSchoolGroupRequired = this.eventData.sectionConfig.isSchoolGroupRequired;
      this.isQuestionnaireRequired = this.eventData.sectionConfig.isQuestionnaireRequired;
      this.isAttachmentRequired = this.eventData.sectionConfig.isAttachmentRequired;
      this.isSingleDayEvent = this.eventData.sectionConfig.isSingleDayEvent;




      if (this.selectedRowJson.event_type == "TTC") {
        if (this.participantRoles.code = "Student") {
          this.participantRoles[1].isDisabled = true
          this.participantRoles = [...this.participantRoles];
        }
      }
      else {
        this.participantRoles[1].isDisabled = false;
      }

      if (this.selectedRowJson.event_type == "CWC" || this.selectedRowJson.event_type == "OVBS") {
        if ((this.participantRoles.code = "Teacher") && (this.participantRoles.code = "Clergy")) {
          this.participantRoles[2].isDisabled = true
          this.participantRoles[3].isDisabled = true
          this.participantRoles = [...this.participantRoles];
        }
      }
      else {
        this.participantRoles[2].isDisabled = false;
        this.participantRoles[3].isDisabled = false;
      }


      if (this.eventData.registrationStatus == "Registered" && this.selectedEventType === 'registered_events') {
        this.isCancelRegiBtnRequired = true;
      }
      else {
        this.isCancelRegiBtnRequired = false;
      }



      if (this.selectedEventType === 'registered_events') {

        this.isUpdateBtnRequired = true;
        this.registrationId = res.data.eventData.enrollmentId;

        let roleDataArray: any = [];
        if (res.data.eventData.role != null) {
          let roleData: any = {
            "code": res.data.eventData.role,
            "roleDesc": res.data.eventData.role
          }
          roleDataArray.push(roleData);
        }

        let participantName: any = [];
        if (this.selectedRowJson.participantId != null) {
          let participantData: any = {
            "userId": this.selectedRowJson.participantId,
            "name": this.selectedRowJson.participantName
          }
          participantName.push(participantData);
        }


       

        this.participantDataFormGroup.patchValue({
          participantName: participantName,
          role: roleDataArray,
          group: this.eventData.selectedGroup
        });

        this.venuesDataFormGroup.patchValue({
          venues: res.data.eventData.selectedVenue
        });

        this.isPraticipantNameReadonly = true;

        this.eventCategoriesData = res.data.eventData.categories;
        for (let row of this.eventCategoriesData) {
          if (row.hasSelected == true) {
            this.catArray.push(row.catMapId);
          }
        }

        this.questionnaireData = res.data.eventData.questionnaire;
        this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionnairesData(this.questionnaireData));

      }
      if (this.selectedEventType === 'upcoming_events') {

        this.isPraticipantNameReadonly = false;

        this.eventCategoriesData = res.data.eventData.categories;
        for (let row of this.eventCategoriesData) {
          row.hasSelected = false;
        }

        let tempFamilyMembersdata = [];
        for (let row of this.familyMembersData) {
          if (row.hasRegistered == false) {
            tempFamilyMembersdata.push(row);
          }
        }
        this.familyMembersData = tempFamilyMembersdata;

        this.questionnaireData = res.data.eventData.questionnaire;
        for (let row of this.questionnaireData) {
          row.answer = null;
        }
        this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionnairesData(this.questionnaireData));

      }

    });

    if (this.selectedRowJson.event_type == "CWC" || this.selectedRowJson.event_type == "Talent Show" || this.selectedRowJson.event_type == "Talent Compition") {
      this.isStudent = true;
    }
    else{
      this.isStudent = false;
    }

  }

  getColDef() {

    return this.columnDefs = [
      { headerName: 'Name', field: 'firstName', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      {
        headerName: 'Date', field: 'startDate', width: 300, resizable: true, sortable: true, filter: true,
        cellRendererFramework: DatePickerRendererComponent
      },
      { headerName: 'Baptismal Name', field: 'baptismalName', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'Country', field: 'country', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'State', field: 'state', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'City', field: 'city', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'Postal Code', field: 'postalCode', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'Parish Name', field: 'parish_name', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
    ];
  }

  addMemOnChange(event: any) {

    this.rowData = [];
    this.selectedUserIds = event.value;

    for (let row of this.selectedUserIds) {
      let index = this.rowDataBinding.findIndex((item: any) => item.userId == row)
      if (index >= 0) {
        this.rowData.push(this.rowDataBinding[index]);
      }
    }

    this.gridOptions = {
      columnDefs: this.getColDef(),
      rowData: this.rowData,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };

  }




  addeventquestionnaire(): FormGroup {
    return this.formBuilder.group({
      questionId: '',
      answer: '',
      answerStartDate: '',
      answerEndDate: '',
      question: '',
      responseType: ''
    });
  }


  setQuestionnairesData(eventQuestionnaireData: any): FormArray {
    const formArray = new FormArray([]);
    eventQuestionnaireData.forEach((e: any) => {

      formArray.push(this.formBuilder.group({
        questionId: e.queId,
        answer: e.answer,
        answerStartDate: (e.answerType === 'Date Range' && e.answer != null) ? formatDate(e.answer.split(',')[0].trim(), 'yyyy-MM-dd', 'en') : "",
        answerEndDate: (e.answerType === 'Date Range' && e.answer != null) ? formatDate(e.answer.split(',')[1].trim(), 'yyyy-MM-dd', 'en') : "",
        question: e.question,
        responseType: e.answerType
      }));
    });
    return formArray;
  }


  catArray: any = [];
  onChange(event: any) {

    console.log("Inside the on Change " + JSON.stringify(event.item) + "Seletion : " + event.event.checked);
    if (event.event.checked == true) {
      this.catArray.push(event.item.catMapId)
    } else {
      this.catArray.splice(this.catArray.indexOf(event.item.catMapId), 1)
    }
    console.log("catArray : " + this.catArray);

  }



  onRegisterEventClick() {


    let questionnaireData: any = [];
    let queData: any = [];
    queData = this.questionnaireDataFormGroup.value;

    for (let row of queData.questionnaire) {
      if (row.answerStartDate == "") {
        let quePayload = {
          "questionId": row.questionId,
          "answer": row.answer
        }
        questionnaireData.push(quePayload);
      }
      else {
        let quePayloadstartEndDate = {
          "questionId": row.questionId,
          "answer": row.answerStartDate + ' , ' + row.answerEndDate
        }
        questionnaireData.push(quePayloadstartEndDate);
      }
    }

    let participantId: any;
    let participantNameData = this.participantDataFormGroup.value.participantName;
    for (let row of participantNameData) {
      participantId = row.userId;
    }


    let payload: any = {

      "registrationStatus": "Registered",
      "eventId": this.selectedRowJson.event_Id,
      "participantId": participantId,
      "eventType": this.selectedRowJson.event_type,
      "group": this.participantDataFormGroup.value.group[0].groupId,
      "eveVenueId": this.venuesDataFormGroup.value.venues.length == 0 ? null : this.venuesDataFormGroup.value.venues[0].venueMapId,
      "role": this.participantDataFormGroup.value.role.length == 0 ? null : this.participantDataFormGroup.value.role[0].code,
      "categories": this.catArray,
      "questionnaire": questionnaireData

    }

    this.apiService.callPostService('registerEvent', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        console.log("res", res);
        this.uiCommonUtils.showSnackBar("Registered for event successfully!", "success", 3000);
        this.router.navigate(['/dashboard/eventRegistration/']);
      }
      else {
        this.uiCommonUtils.showSnackBar("Please fill all mandatory fields!", "error", 3000);
      }

    });

  }

  onUpdateRegistrationClick() {


    let questionnaireData: any = [];
    let queData: any = [];
    queData = this.questionnaireDataFormGroup.value;

    for (let row of queData.questionnaire) {
      if (row.answerStartDate == "") {
        let quePayload = {
          "questionId": row.questionId,
          "answer": row.answer
        }
        questionnaireData.push(quePayload);
      }
      else {
        let quePayloadstartEndDate = {
          "questionId": row.questionId,
          "answer": row.answerStartDate + ' , ' + row.answerEndDate
        }
        questionnaireData.push(quePayloadstartEndDate);
      }
    }

    let participantId: any;
    let participantNameData = this.participantDataFormGroup.value.participantName;
    for (let row of participantNameData) {
      participantId = row.userId;
    }


    let payload: any = {

      "registrationStatus": "Registered",
      "eventId": this.selectedRowJson.event_Id,
      "participantId": participantId,
      "enrollmentId": this.registrationId,
      "eventPartiRegId": this.eventData.eventPartiRegId,
      "eventType": this.selectedRowJson.event_type,
      "group": this.participantDataFormGroup.value.group[0].groupId,
      "eveVenueId": this.venuesDataFormGroup.value.venues.length == 0 ? null : this.venuesDataFormGroup.value.venues[0].venueMapId,
      "role": this.participantDataFormGroup.value.role.length == 0 ? null : this.participantDataFormGroup.value.role[0].code,
      "categories": this.catArray,
      "questionnaire": questionnaireData

    }

    this.apiService.callPostService('registerEvent', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        console.log("res", res);
        this.uiCommonUtils.showSnackBar("Event registration updated successfully!", "success", 3000);
        this.router.navigate(['/dashboard/eventRegistration/']);
      }
      else {
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      }

    });




  }

  onCancelRegistrationClick() {

    let questionnaireData: any = [];
    let queData: any = [];
    queData = this.questionnaireDataFormGroup.value;

    for (let row of queData.questionnaire) {
      if (row.answerStartDate == "") {
        let quePayload = {
          "questionId": row.questionId,
          "answer": row.answer
        }
        questionnaireData.push(quePayload);
      }
      else {
        let quePayloadstartEndDate = {
          "questionId": row.questionId,
          "answer": row.answerStartDate + ' , ' + row.answerEndDate
        }
        questionnaireData.push(quePayloadstartEndDate);
      }
    }

    let participantId: any;
    let participantNameData = this.participantDataFormGroup.value.participantName;
    for (let row of participantNameData) {
      participantId = row.userId;
    }


    let payload: any = {

      "registrationStatus": "Canceled",
      "eventId": this.selectedRowJson.event_Id,
      "participantId": participantId,
      "enrollmentId": this.registrationId,
      "eventPartiRegId": this.eventData.eventPartiRegId,
      "eventType": this.selectedRowJson.event_type,
      "group": this.participantDataFormGroup.value.group[0].groupId,
      "eveVenueId": this.venuesDataFormGroup.value.venues.length == 0 ? null : this.venuesDataFormGroup.value.venues[0].venueMapId,
      "role": this.participantDataFormGroup.value.role.length == 0 ? null : this.participantDataFormGroup.value.role[0].code,
      "categories": this.catArray,
      "questionnaire": questionnaireData

    }

    this.apiService.callPostService('registerEvent', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        console.log("res", res);
        this.uiCommonUtils.showSnackBar("Event registration canceled successfully!", "success", 3000);
        this.router.navigate(['/dashboard/eventRegistration/']);
      }
      else {
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      }

    });

  }

  onCancelClick() {
    this.router.navigate(['/dashboard/eventRegistration/']);
  }





  //miscellaneous
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }




}





