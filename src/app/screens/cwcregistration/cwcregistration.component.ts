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
  dropdownSettingsRoles: any;
  dropdownSettingsGroup: any;
  venueList: any;
  eventData: any = {};
  participantRoles: any;
  regEndDate: any;
  eventStartDate: any;
  eventCategoriesData: any;
  questionnaireData: any;
  areCategoriesChecked: any;
  isUpdateBtnRequired: any;
  registrationId: any;
  isCancelRegiBtnRequired: any;
  eventEndDate: any;

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
    idField: 'venueId',
    textField: 'venueName',
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

    // if(){

    // }

    if (this.eventRegistrationDataService.getSelectedRowData() != undefined) {
      this.selectedRowJson = this.eventRegistrationDataService.getSelectedRowData();
      //this.selectedEventType = this.eventRegistrationDataService.getselectedEventData();
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson));
    }

    if (this.selectedRowJson.event_type == "TTC") {
      this.isTtcEvent = true;
    }
    else {
      this.isTtcEvent = false;
    }

    this.dropdownSettingsVenues = this.dropdownSettingsForVenues;
    this.dropdownSettingsRoles = this.dropdownSettingsForRoles;





    this.venuesDataFormGroup = this.formBuilder.group({
      venues: new FormControl('')
    });

    this.participantDataFormGroup = this.formBuilder.group({
      role: new FormControl(''),
      group: new FormControl('')
    });

    this.questionnaireDataFormGroup = this.formBuilder.group({
      questionnaire: this.formBuilder.array([this.addeventquestionnaire()])
    });

    // this.apiService.callGetService(`getuserRecords?eventId=${this.selectedRowJson.event_Id}&type=ttc_reg_add_participants`).subscribe((res) => {
    //   this.partIds = res.data.metaData;
    //   this.rowDataBinding = res.data.metaData;
    // });

    this.columnDefs = this.getColDef();


    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.eventId = this.selectedRowJson.event_Id;



    // this.startDate = new Date(this.selectedRowJson.startDate).toLocaleDateString("en-us");
    // this.endDate = new Date(this.selectedRowJson.endDate).toLocaleDateString("en-us");

    this.registrationStartDate = new Date(this.selectedRowJson.registrationStartDate).toLocaleDateString("en-us");
    this.registrationEndDate = new Date(this.selectedRowJson.registrationEndDate).toLocaleDateString("en-us");
    let addQParam: boolean = false;
    console.log("selectedEvent Type :: " + JSON.stringify(this.selectedEventType));
    if (this.selectedEventType === 'registered_events' || this.selectedEventType === 'completed_events')
      addQParam = true;


    this.apiService.callGetService(`getEventDef?eventId=${this.selectedRowJson.event_Id}`).subscribe((res) => {


      this.isUpdateBtnRequired = false;
      this.venueList = res.data.eventData.venues;
      this.eventData = res.data.eventData;
      this.regEndDate = this.eventData.regEndDate;
      this.eventStartDate = this.eventData.eventStartDate;
      this.eventEndDate = this.eventData.eventEndDate;
      this.participantRoles = res.data.eventData.participantRoles;
      this.eventCategoriesData = res.data.eventData.categories;


      this.isVenueRequired = this.eventData.sectionConfig.isVenueRequired;
      this.isCategoryRequired = this.eventData.sectionConfig.isCategoryRequired;
      this.isSchoolGroupRequired = this.eventData.sectionConfig.isSchoolGroupRequired;
      this.isQuestionnaireRequired = this.eventData.sectionConfig.isQuestionnaireRequired;
      this.isAttachmentRequired = this.eventData.sectionConfig.isAttachmentRequired;
      this.isSingleDayEvent = this.eventData.sectionConfig.isSingleDayEvent;




      if (this.eventData.registrationStatus == "Registered") {
        this.isCancelRegiBtnRequired = true;
      }
      else {
        this.isCancelRegiBtnRequired = false;
      }



      this.regEndDate = new Date(this.regEndDate).toLocaleDateString("en-us");
      this.eventStartDate = new Date(this.eventStartDate).toLocaleDateString("en-us");
      this.eventEndDate = new Date(this.eventEndDate).toLocaleDateString("en-us");

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


        this.participantDataFormGroup.patchValue({
          role: roleDataArray
        });

        this.venuesDataFormGroup.patchValue({
          venues: res.data.eventData.selectedVenue
        });

        this.questionnaireData = res.data.eventData.questionnaire;
        this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionnairesData(this.questionnaireData));

      }
      else {

        this.areCategoriesChecked = false;
        this.questionnaireData = res.data.eventData.questionnaire;
        this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionnairesData(this.questionnaireData));

      }

    });




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






  // addenrollmentId(): FormGroup {
  //   return this.formBuilder.group({
  //     enrollmentId: ''
  //   });
  // }





  /*
    updateCheckedOptions(categories:any, event:any) {
      this.categoriesDataFormGroup[categories] = event.target.checked;
   }
   */
  /*
   checked(item:Boolean){
    if(this.categoriesDataFormGroup.indexOf(item) != -1){
      return true;
    }
  }
  */
  catArray: any = [];
  onChange(event: any) {
    console.log("Inside the on Change " + JSON.stringify(event.item) + "Seletion : " + event.event.checked);
    if (event.event.checked == true) {
      // if(this.catArray.indexOf(event.item.eventCategoryID) < 0)
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


    let payload: any = {

      "registrationStatus": "Registered",
      "eventId": this.selectedRowJson.event_Id,
      "participantId": this.loggedInUser,
      "eventType": this.selectedRowJson.event_type,
      "group": "Group 1",
      "eveVenueId": this.venuesDataFormGroup.value.venues.length == 0 ? null : this.venuesDataFormGroup.value.venues[0].venueId,
      "role": this.participantDataFormGroup.value.role.length == 0 ? null : this.participantDataFormGroup.value.role[0].code,
      "categories": this.catArray,
      "questionnaire": questionnaireData

    }

    this.apiService.callPostService('registerEvent', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        console.log("res", res);
        this.uiCommonUtils.showSnackBar("Registered for event successfully!", "success", 3000);
      }
      else {
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      }

    });

    // if(this.isTtcEvent = true){

    //   let payLoadNew = {
    //       "eventId": this.eventId,
    //       "participants": this.selectedUserIds
    //   }

    //   console.log("payLoadNew : " + JSON.stringify(payLoadNew));

    //   this.apiService.callPostService('registerEvent',payLoadNew ).subscribe((res: any) => {
    //     if (res.data.status == "success") {
    //       this.uiCommonUtils.showSnackBar("Registered for event successfully!", "success", 3000);
    //     }
    //     else
    //       this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
    //   });
    // }
    // else{

    //   let eventRegistrationForm: any = {};
    //   eventRegistrationForm = { ...this.questionnaireDataFormGroup.value }
    //   console.log("this.registration form", eventRegistrationForm);

    //   //this.cwcRegistrationForm.value.eventId = this.eventId;
    //   /*
    //       let catArray : any = []
    //       eventRegistrationForm.categories.filter((item:any) => {
    //         catArray.push(item.eventCategoryID)
    //       });
    //       */
    //   eventRegistrationForm.categories = this.catArray;

    //   let payLoad = {
    //     categories: this.catArray,
    //     questionnaire: this.questionnaireDataFormGroup.value.questionnaire,
    //     eventId: this.selectedRowJson.event_Id,
    //     participantId: this.loggedInUser,
    //     schoolGrade: '',
    //   }
    //   console.log("Payload : " + JSON.stringify(payLoad));
    //   //console.log("eventRegistrationForm : " + eventRegistrationForm);


    //   //console.log("this.categoriesDataFormGroup.value.categories.length" + this.categoriesDataFormGroup.value.categories.length);
    //   if (this.categoriesDataFormGroup.value.categories.length == 0) {
    //     this.uiCommonUtils.showSnackBar('You should select atleast one category', 'Dismiss', 3000);
    //   }


    //   this.apiService.callPostService('registerEvent',payLoad ).subscribe((res: any) => {
    //     if (res.data.status == "success") {
    //       this.uiCommonUtils.showSnackBar("Registered for event successfully!", "success", 3000);
    //     }
    //     else
    //       this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
    //   });
    // }

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


    let payload: any = {

      "registrationStatus": "Registered",
      "eventId": this.selectedRowJson.event_Id,
      "participantId": this.loggedInUser,
      "enrollmentId": this.registrationId,
      "eventPartiRegId": this.eventData.eventPartiRegId,
      "eventType": this.selectedRowJson.event_type,
      "group": "Group 1",
      "eveVenueId": this.venuesDataFormGroup.value.venues.length == 0 ? null : this.venuesDataFormGroup.value.venues[0].venueId,
      "role": this.participantDataFormGroup.value.role.length == 0 ? null : this.participantDataFormGroup.value.role[0].code,
      "categories": this.catArray,
      "questionnaire": questionnaireData

    }

    this.apiService.callPostService('registerEvent', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        console.log("res", res);
        this.uiCommonUtils.showSnackBar("Event registration updated successfully!", "success", 3000);
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


    let payload: any = {

      "registrationStatus": "Canceled",
      "eventId": this.selectedRowJson.event_Id,
      "participantId": this.loggedInUser,
      "enrollmentId": this.registrationId,
      "eventPartiRegId": this.eventData.eventPartiRegId,
      "eventType": this.selectedRowJson.event_type,
      "group": "Group 1",
      "eveVenueId": this.venuesDataFormGroup.value.venues.length == 0 ? null : this.venuesDataFormGroup.value.venues[0].venueId,
      "role": this.participantDataFormGroup.value.role.length == 0 ? null : this.participantDataFormGroup.value.role[0].code,
      "categories": this.catArray,
      "questionnaire": questionnaireData

    }

    this.apiService.callPostService('registerEvent', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        console.log("res", res);
        this.uiCommonUtils.showSnackBar("Event registration canceled successfully!", "success", 3000);
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






// this.apiService.callGetService(`getEvent?id=${this.selectedRowJson.event_Id}&isParticipant=`+addQParam.toString()).subscribe((res) => {

//   this.venuesList = res.data.eventData.venues;

//   //getting start date and end date from this api to set validation in grid. 
//   this.minDate = res.data.eventData.startDate;
//   this.maxDate = res.data.eventData.endDate;

//   this.enrollmentId = res.data.eventData.enrollmentId;
//   //console.log("this.enrollmentId : " + this.enrollmentId);

//   if (this.enrollmentId && (this.selectedEventType == 'registered_events' || this.selectedEventType=='completed_events')) {
//     this.enrollmentId = res.data.eventData.enrollmentId;

//     this.showHideEnrollmentId = true;
//   } else {
//     this.showHideEnrollmentId = false;
//   }

//   this.eventCatMapId = res.data.eventData.categories.eventCatMapId;
//   ///console.log(this.eventCatMapId);


//   //this.eventcategorydata = res.data.eventData.categories;

//   this.eventQuestionnaireData = res.data.eventData.questionnaire;


//   this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionnairesData(this.eventQuestionnaireData))


//   // for (let i = 0; i < this.eventcategorydata.length; i++) {
//   //     this.eventCatMapId = this.eventcategorydata[i].eventCatMapId;
//   //    // console.log("eventCatMapId : " + this.eventCatMapId)
//   //   }

// });