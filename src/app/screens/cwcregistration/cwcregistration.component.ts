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


@Component({
  selector: 'app-cwcregistration',
  templateUrl: './cwcregistration.component.html',
  styleUrls: ['./cwcregistration.component.css']
})
export class CwcregistrationComponent implements OnInit {

  //cwcRegistrationForm: any;
  categoriesDataFormGroup: any;
  questionnaireDataFormGroup: any;
  userMetaData: any;
  loggedInUser: any;
  eventcategorydata!: any[];
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
  eventCatMapId:any;

  constructor(private router: Router, private apiService: ApiService, private formBuilder: FormBuilder,
    private uiCommonUtils: uiCommonUtils, private eventRegistrationDataService: EventRegistrationDataService) { }

  selected!: { startDate: Moment; endDate: Moment; };
  selectedRowJson: any = {};
  selectedEventType : any = {};
  currentURL='';
  venuesList!: any[];

  minDate:string = '';
  maxDate:string = '';

  ngOnInit(): void {

    this.currentURL = window.location.href; 
    let splitedURL = this.currentURL.split('/');
    this.selectedEventType = splitedURL[splitedURL.length - 1]; 
    console.log("currentURL is last value: " + this.selectedEventType);
    
    
    if (this.eventRegistrationDataService.getSelectedRowData() != undefined){
      this.selectedRowJson = this.eventRegistrationDataService.getSelectedRowData();
      //this.selectedEventType = this.eventRegistrationDataService.getselectedEventData();
    console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson));
    }

    if(this.selectedRowJson.event_type == "TTC"){
      this.isTtcEvent = true;
    }
    else{
      this.isTtcEvent = false;
    }


    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.eventId = this.selectedRowJson.event_Id;



    this.startDate = new Date(this.selectedRowJson.startDate).toLocaleDateString("en-us");
    this.endDate = new Date(this.selectedRowJson.endDate).toLocaleDateString("en-us");

    this.registrationStartDate = new Date(this.selectedRowJson.registrationStartDate).toLocaleDateString("en-us");
    this.registrationEndDate = new Date(this.selectedRowJson.registrationEndDate).toLocaleDateString("en-us");
    let addQParam :boolean = false;
    console.log("selectedEvent Type :: " + JSON.stringify(this.selectedEventType));
    if(this.selectedEventType === 'registered_events' || this.selectedEventType === 'completed_events')
      addQParam = true;
    
    this.apiService.callGetService(`getEvent?id=${this.selectedRowJson.event_Id}&isParticipant=`+addQParam.toString()).subscribe((res) => {

      this.venuesList = res.data.eventData.venues;
      
      //getting start date and end date from this api to set validation in grid. 
      this.minDate = res.data.eventData.startDate;
      this.maxDate = res.data.eventData.endDate;

      this.enrollmentId = res.data.eventData.enrollmentId;
      //console.log("this.enrollmentId : " + this.enrollmentId);
      
      if (this.enrollmentId && (this.selectedEventType == 'registered_events' || this.selectedEventType=='completed_events')) {
        this.enrollmentId = res.data.eventData.enrollmentId;
       
        this.showHideEnrollmentId = true;
      } else {
        this.showHideEnrollmentId = false;
      }
      
      this.eventCatMapId = res.data.eventData.categories.eventCatMapId;
      ///console.log(this.eventCatMapId);
     
      
      this.eventcategorydata = res.data.eventData.categories;

      this.eventQuestionnaireData = res.data.eventData.questionnaire;

      this.categoriesDataFormGroup.setControl('categories', this.setDataForCategories(this.eventcategorydata));
      this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionnairesData(this.eventQuestionnaireData))


      for (let i = 0; i < this.eventcategorydata.length; i++) {
          this.eventCatMapId = this.eventcategorydata[i].eventCatMapId;
         // console.log("eventCatMapId : " + this.eventCatMapId)
        }

    });

    this.categoriesDataFormGroup = this.formBuilder.group({
      categories: this.formBuilder.array([this.addeventCategory()]),
    });
    this.questionnaireDataFormGroup = this.formBuilder.group({
      questionnaire: this.formBuilder.array([this.addeventquestionnaire()])
    });

    this.apiService.callGetService(`getuserRecords?eventId=${this.selectedRowJson.event_Id}&type=ttc_reg_add_participants`).subscribe((res) => {
      this.partIds = res.data.metaData;
      this.rowDataBinding = res.data.metaData;
    });

    this.columnDefs = this.getColDef()

  }



  getColDef(){

    return   this.columnDefs = [
      { headerName: 'Name', field: 'firstName', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true },
      { 
        headerName: 'Date', field: 'startDate', width:300, resizable: true,sortable: true, filter: true, 
        cellRendererFramework: DatePickerRendererComponent
      },
      { headerName: 'Baptismal Name', field: 'baptismalName', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true },
      { headerName: 'Country', field: 'country', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true},
      { headerName: 'State', field: 'state', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true,  },
      { headerName: 'City', field: 'city', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true},
      { headerName: 'Postal Code', field: 'postalCode', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true},
      { headerName: 'Parish Name', field: 'parish_name', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true},
    ];
  }

  addMemOnChange(event : any){

    this.rowData = [];     
    this.selectedUserIds = event.value;

    for(let row of this.selectedUserIds){
      let index = this.rowDataBinding.findIndex((item: any) => item.userId == row) 
      if(index >= 0){
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

  

 


  addeventCategory(): FormGroup {
    return this.formBuilder.group({
      eventCategoryID: '',
      name: '',
    });
  }
  addeventquestionnaire(): FormGroup {
    return this.formBuilder.group({
      questionId: '',
      answer: '',
      question: '',
      responseType: ''
    });
  }

  addenrollmentId(): FormGroup {
    return this.formBuilder.group({
      enrollmentId: ''
    });
  }

  setDataForCategories(eventcategorydata: any): FormArray {
    const formArray = new FormArray([]);
    eventcategorydata.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        eventCategoryID: e.eventCategoryID,
        name: e.name

      }));
    });
    return formArray;
  }
  setQuestionnairesData(eventQuestionnaireData: any): FormArray {
    const formArray = new FormArray([]);
    eventQuestionnaireData.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        questionId: e.questionId,
        answer: '',
        question: e.question,
        responseType: e.responseType

      }));
    });
    return formArray;
  }

  onCancelRegistrationClick() {
    this.router.navigate(['/dashboard/eventRegistration/']);
    
  }

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
      this.catArray.push(event.item.eventCategoryID)
    } else {
      this.catArray.splice(this.catArray.indexOf(event.item.eventCategoryID), 1)
    }
    console.log("catArray : " + this.catArray);
  }


  registerEvent() {
   
    if(this.isTtcEvent = true){

      let payLoadNew = {
          "eventId": this.eventId,
          "participants": this.selectedUserIds
      }

      console.log("payLoadNew : " + JSON.stringify(payLoadNew));

      this.apiService.callPostService('registerEvent',payLoadNew ).subscribe((res: any) => {
        if (res.data.status == "success") {
          this.uiCommonUtils.showSnackBar("Registered for event successfully!", "success", 3000);
        }
        else
          this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      });
    }
    else{

      let eventRegistrationForm: any = {};
      eventRegistrationForm = { ...this.questionnaireDataFormGroup.value }
      console.log("this.registration form", eventRegistrationForm);
  
      //this.cwcRegistrationForm.value.eventId = this.eventId;
      /*
          let catArray : any = []
          eventRegistrationForm.categories.filter((item:any) => {
            catArray.push(item.eventCategoryID)
          });
          */
      eventRegistrationForm.categories = this.catArray;
  
      let payLoad = {
        categories: this.catArray,
        questionnaire: this.questionnaireDataFormGroup.value.questionnaire,
        eventId: this.selectedRowJson.event_Id,
        participantId: this.loggedInUser,
        schoolGrade: '',
      }
      console.log("Payload : " + JSON.stringify(payLoad));
      //console.log("eventRegistrationForm : " + eventRegistrationForm);
  
  
      //console.log("this.categoriesDataFormGroup.value.categories.length" + this.categoriesDataFormGroup.value.categories.length);
      if (this.categoriesDataFormGroup.value.categories.length == 0) {
        this.uiCommonUtils.showSnackBar('You should select atleast one category', 'Dismiss', 3000);
      }
  
      
      this.apiService.callPostService('registerEvent',payLoad ).subscribe((res: any) => {
        if (res.data.status == "success") {
          this.uiCommonUtils.showSnackBar("Registered for event successfully!", "success", 3000);
        }
        else
          this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      });
    }
    
  }
}
