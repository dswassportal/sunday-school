import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { GridOptions, GridApi } from "ag-grid-community";
import { HttpClient } from '@angular/common/http';
import { uiCommonUtils } from 'src/app/common/uiCommonUtils';
import { EventDataService } from '../events/event.dataService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-creation',
  templateUrl: './event-creation.component.html',
  styleUrls: ['./event-creation.component.css']
})
export class EventCreationComponent implements OnInit {

  eventCreationForm: any;
  eventsDataFormGroup: any;
  venuesDataFormGroup: any;
  categoriesDataFormGroup: any;
  questionnaireDataFormGroup: any;
  ttcExamDataFormGroup: any;
  eventId: any;
  rowData: any;
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
  categories: any;
  eventarray!: any[];
  eventCategoryForm!: FormGroup;
  ISCategory!: any[];
  newVenues!: any[];
  isVenueRequired: any;
  isProctorRequired: any;
  isJudgeRequired: any;
  eventStartDateMin: any;
  eventEndDateMax: any;
  isSchoolGradeRequired: any;
  isQuestionnariesRequired!: boolean;
  isttcExamDataFormGroupRequired!: boolean;
  public myreg = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi
  minDate = new Date();
  selectedRowJson: any = {};


  constructor(private apiService: ApiService,
    private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils,
    private eventDataService: EventDataService, private router: Router) { }

  getData() {

    this.apiService.getRegionAndParish().subscribe((res: any) => {
      this.regionList = res.data.metaData.regions;
    });

    this.apiService.getEventType().subscribe((res: any) => {
      this.eventList = res.data.metaData.eventType;
      this.eventcategorydata = res.data.metaData.eventType;
    });

    this.apiService.getUserRoleData().subscribe(res => {
      this.orgs = res.data.metadata.orgs;
      try {
        let temp = { value: this.eventsDataUpdate.orgType, id: this.eventsDataUpdate.orgId[0] };
        this.onOrgSelect(temp);
      } catch (err) { }
    });

  }


  ngOnInit(): void {


    // For getting data of selected row from grid 
    if (this.eventDataService.getSelectedRowData() != undefined) {
      this.selectedRowJson = this.eventDataService.getSelectedRowData();
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson))
    }

    this.categoriesDataFormGroup = this.formBuilder.group({
      categories: this.formBuilder.array([this.addeventCategory()])
    });

    this.questionnaireDataFormGroup = this.formBuilder.group({
      questionnaire: this.formBuilder.array([this.adduserquestionary()])
    });

    this.ttcExamDataFormGroup = this.formBuilder.group({
      ttcExamStartDate: new FormControl('', Validators.required),
      ttcExamEndDate: new FormControl('', Validators.required),
    });



    this.alluserdata = this.uiCommonUtils.getUserMetaDataJson();
    this.orgId = this.alluserdata.orgId;
    this.userId = this.alluserdata.userId;


    this.eventsDataFormGroup = this.formBuilder.group({
      eventId: '',
      name: new FormControl('', Validators.required),
      eventType: new FormControl('', Validators.required),
      orgType: new FormControl('', Validators.required),
      orgId: new FormControl(''),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      registrationStartDate: new FormControl('', Validators.required),
      registrationEndDate: new FormControl('', Validators.required),
      eventUrl: new FormControl('', [Validators.required, Validators.pattern(this.myreg)]),
      description: new FormControl('', Validators.required),
      eventCoordinator: new FormControl('', Validators.required)
    });//{validator: this.checkDates}); //to compare event registration dates

    this.venuesDataFormGroup = this.formBuilder.group({
      venues: this.formBuilder.array([this.adduserVenuAndProcter()])
    });

    // For getting event data by event id 
    this.apiService.callGetService(`getEvent?id=${this.selectedRowJson.event_Id}`).subscribe((res) => {
      console.log("event Id data : " + res.data.eventData);
      this.eventsDataUpdate = res.data.eventData;
      this.getData();
      this.eventsDataFormGroup.value.eventType = res.data.eventData.eventType;
      this.eventTypeSelChange();

      // For binding data on update screen
      if (this.selectedRowJson.event_Id != undefined || this.selectedRowJson.event_Id != null) {
        console.log("Patch Values event_Id = " + this.selectedRowJson.event_Id);

        this.eventsDataFormGroup.patchValue({
          eventId: this.eventsDataUpdate.eventId,
          name: this.eventsDataUpdate.name,
          eventType: this.eventsDataUpdate.eventType,
          orgType: this.eventsDataUpdate.orgType,
          orgId: this.eventsDataUpdate.orgId,   // array
          startDate: this.eventsDataUpdate.startDate,
          endDate: this.eventsDataUpdate.endDate,
          registrationStartDate: this.eventsDataUpdate.registrationStartDate,
          registrationEndDate: this.eventsDataUpdate.registrationEndDate,
          eventUrl: this.eventsDataUpdate.eventUrl,
          description: this.eventsDataUpdate.description,
          eventCoordinator: this.eventsDataUpdate.eventCoordinator // array
        });

        if (this.eventsDataUpdate.venues != null) {
          this.venuesDataFormGroup.patchValue({
            venues: this.eventsDataUpdate.venues // array
          });
        }

        if (this.eventsDataUpdate.categories != null) {
          this.categoriesDataFormGroup.patchValue({
            categories: this.eventsDataUpdate.categories // array
          });
        }


        if (this.eventsDataUpdate.questionnaire != null) {
          this.questionnaireDataFormGroup.patchValue({
            questionnaire: this.eventsDataUpdate.questionnaire // array
          });
        }

        this.ttcExamDataFormGroup.patchValue({
          ttcExamStartDate: this.eventsDataUpdate.ttcExamStartDate,
          ttcExamEndDate: this.eventsDataUpdate.ttcExamEndDate
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


  // For relational dropdown ie. orgId and orgType
  onOrgSelect(event: any) {
    console.log(event);
    this.selectedOrg = event.value;
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



    // let oldvalue = startnew;
    //this.eventsDataFormGroup.controls['registrationStartDate'].reset();
    //this.eventsDataFormGroup.controls['registrationStartDate'].patchValue(oldvalue);
    // return this.eventsDataFormGroup.controls['registrationStartDate'].setErrors({ 'invaliddaterange': false });

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

    //let oldvalue = endnew1;
    //this.eventsDataFormGroup.controls['registrationEndDate'].reset();
    //this.eventsDataFormGroup.controls['registrationEndDate'].patchValue(oldvalue);
    // return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange': false });
  }
  //Event End Date Validator that is endDate>startDate
  comparisonEventEnddateValidator(): any {

    let startDate = this.eventsDataFormGroup.value['startDate'];
    let endDate = this.eventsDataFormGroup.value['endDate'];

    // let eventstartnew = new Date(startDate);
    //let eventendnew = new Date(endDate);
    if (startDate > endDate) {
      return this.eventsDataFormGroup.controls['endDate'].setErrors({ 'invaliddaterange': true });
    }
    /* let oldvalue = eventstartnew;
     this.eventsDataFormGroup.controls['startDate'].reset();
     this.eventsDataFormGroup.controls['startDate'].patchValue(oldvalue);
     return this.eventsDataFormGroup.controls['startDate'].setErrors({ 'invaliddaterange': false });
     */

  }
  comparisonEventStartdateValidator(): any {

    let startDate = this.eventsDataFormGroup.value['startDate'];
    let endDate = this.eventsDataFormGroup.value['endDate'];

    let eventstartnew = new Date(startDate);
    let eventendnew = new Date(endDate);
    if (eventstartnew > eventendnew) {
      return this.eventsDataFormGroup.controls['startDate'].setErrors({ 'invaliddaterange': true });
    }
    /* let oldvalue = eventstartnew;
     this.eventsDataFormGroup.controls['startDate'].reset();
     this.eventsDataFormGroup.controls['startDate'].patchValue(oldvalue);
     return this.eventsDataFormGroup.controls['startDate'].setErrors({ 'invaliddaterange': false });
     */

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
    /*let oldvalue = regiEndDatenew;
    this.eventsDataFormGroup.controls['registrationEndDate'].reset();
    this.eventsDataFormGroup.controls['registrationEndDate'].patchValue(oldvalue);
    return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange': false });
    */

  }
  comparisonRegiEnddateandEventStartValidator(): any {
    let regiEndDate = this.eventsDataFormGroup.value['registrationEndDate'];
    let startDate = this.eventsDataFormGroup.value['startDate'];


    let eventstartnew = new Date(startDate);
    let regiEndDatenew = new Date(regiEndDate);
    if (regiEndDatenew > eventstartnew) {
      return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange2': true });
    }
    /*let oldvalue = regiEndDatenew;
    this.eventsDataFormGroup.controls['registrationEndDate'].reset();
    this.eventsDataFormGroup.controls['registrationEndDate'].patchValue(oldvalue);
    return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange': false });
    */

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
    /*let oldvalue = regiEndDatenew;
    this.eventsDataFormGroup.controls['registrationEndDate'].reset();
    this.eventsDataFormGroup.controls['registrationEndDate'].patchValue(oldvalue);
    return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange': false });
    */

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
    /*let oldvalue = regiEndDatenew;
    this.eventsDataFormGroup.controls['registrationEndDate'].reset();
    this.eventsDataFormGroup.controls['registrationEndDate'].patchValue(oldvalue);
    return this.eventsDataFormGroup.controls['registrationEndDate'].setErrors({ 'invaliddaterange': false });
    */

  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  eventTypeSelChange() {

    //for getting event co ordinator as per event type
    if (this.eventsDataFormGroup.value.eventType == 'CWC') {
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

    if (this.eventsDataFormGroup.value.eventType == 'TTC') {
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

    if (this.eventsDataFormGroup.value.eventType == 'OVBS') {
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

  }



  onEventsNextBtnClick() {

    if (this.eventsDataFormGroup.valid) {

      // For getting Proctor data as per rolesdata
      if (this.eventsDataFormGroup.value.eventType == 'CWC') {
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

      if (this.eventsDataFormGroup.value.eventType == 'TTC') {
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

      if (this.eventsDataFormGroup.value.eventType == 'OVBS') {
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

      // For binding categories section as per eventType on create event screen
      if (this.eventFormLabel == false || !this.eventFormLabel) {
        for (let i = 0; i < this.eventList.length; i++) {
          if (this.eventsDataFormGroup.value.eventType == this.eventList[i].eventType) {
            this.categoriesDataFormGroup.setControl('categories', this.setEventCategory(this.eventcategorydata[i].eventName));
          }
        }
      }

      // For binding categories section as per eventType on update event screen
      if (this.eventFormLabel == true) {
        let updatedCategories: any = [];

        for (let category of this.eventsDataUpdate.categories) {
          if (category.eventCatMapId != null) {
            updatedCategories.push(category);
          }
        }
        for (let i = 0; i < this.eventList.length; i++) {
          if (this.eventsDataFormGroup.value.eventType == this.eventList[i].eventType) {
            this.categoriesDataFormGroup.setControl('categories', this.setEventCategory(updatedCategories));
            this.venuesDataFormGroup.setControl('venues', this.setuserVenuAndProcter(this.eventsDataUpdate.venues));
            this.questionnaireDataFormGroup.setControl('questionnaire', this.setQuestionaireData(this.eventsDataUpdate.questionnaire));
          }
        }
      }


      // For showing and hiding different sections and fields as per eventType
      for (let i = 0; i < this.eventList.length; i++) {
        if (this.eventList[i].eventType == this.eventsDataFormGroup.value.eventType) {
          this.isVenueRequired = this.eventList[i].isVenueRequired;
          this.isProctorRequired = this.eventList[i].isProctorRequired;
          this.isJudgeRequired = this.eventList[i].isJudgeRequired;
          this.isSchoolGradeRequired = this.eventList[i].isSchoolGradeRequired;
        }
      }
    }

    // for hiding and showing different sections as per event type
    if (this.eventsDataFormGroup.value.eventType == 'TTC') {
      this.isQuestionnariesRequired = false;
      this.isttcExamDataFormGroupRequired = true;
      this.eventStartDateMin = this.eventsDataFormGroup.value.startDate;
      this.eventEndDateMax = this.eventsDataFormGroup.value.endDate;
    }
    else {
      this.isQuestionnariesRequired = true;
      this.isttcExamDataFormGroupRequired = false;
    }




  }

  onCategoriesNextBtn() {
    if (this.categoriesDataFormGroup.value.categories.length == 0) {
      this.uiCommonUtils.showSnackBar("Event should atleast have one category!", "error", 3000);
    }
  }

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
    (<FormArray>this.categoriesDataFormGroup.get('categories').removeAt(index));
  }

  onCloseBtnClick() {
    this.router.navigate(['/dashboard/events/']);
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

  setEventCategory(eventcategorydata: any): FormArray {
    const formArray = new FormArray([]);
    eventcategorydata.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        eventCategoryID: e.id,
        name: e.name,
        schoolGradeFrom: e.schoolGradeFrom,
        schoolGradeTo: e.schoolGradeTo,
        judges: [e.judges],
        venueId: [e.venueId],
        eventCatMapId: e.eventCatMapId
      }));
    });
    return formArray;
  }

  setuserVenuAndProcter(venuesdataOfdata: any): FormArray {
    const formArray = new FormArray([]);
    venuesdataOfdata.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        venueId: e.venueId,
        proctorId: e.proctorId,
        eventVenueId: e.eventVenueId
      }));
    });
    return formArray;
  }

  setQuestionaireData(questionaireData: any): FormArray {
    const formArray = new FormArray([]);
    questionaireData.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        questionId: e.questionId,
        question: e.question,
        responseType: e.responseType
      }));
    });
    return formArray;
  }





  createEvent() {

    if (this.eventsDataFormGroup.value.eventType == 'TTC' || this.eventsDataFormGroup.value.eventType == 'OBVS' || this.eventsDataFormGroup.value.eventType == 'CWC') {
      if (this.categoriesDataFormGroup.value.categories.length == 0) {
        this.uiCommonUtils.showSnackBar("Event should atleast have one category!", "error", 3000);
      }
      else {
        let eventCreationForm: any = {};
        eventCreationForm = { ...this.eventsDataFormGroup.value, ...this.venuesDataFormGroup.value, ...this.categoriesDataFormGroup.value, ...this.questionnaireDataFormGroup.value }
        console.log("this.eventCreationForm", eventCreationForm);
        this.apiService.insertevents({ data: eventCreationForm }).subscribe((res: any) => {
          if (res.data.status == "success") {
            this.uiCommonUtils.showSnackBar("Event Created Successfully!", "success", 3000);
          }
          else
            this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
        });
      }
    }
    else if (this.eventsDataFormGroup.value.eventType == 'CWC') {
      if (this.venuesDataFormGroup.value.venues.length == 0) {
        this.uiCommonUtils.showSnackBar("Event should atleast have one venue!", "error", 3000);
      }
      else {
        let eventCreationForm: any = {};
        eventCreationForm = { ...this.eventsDataFormGroup.value, ...this.venuesDataFormGroup.value, ...this.categoriesDataFormGroup.value, ...this.questionnaireDataFormGroup.value }
        console.log("this.eventCreationForm", eventCreationForm);
        this.apiService.insertevents({ data: eventCreationForm }).subscribe((res: any) => {
          if (res.data.status == "success") {
            this.uiCommonUtils.showSnackBar("Event Created Successfully!", "success", 3000);
          }
          else
            this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
        });
      }
    }

    this.onCloseBtnClick();
  }

  updateEvent() {
    if (this.eventsDataFormGroup.value.eventType == 'TTC' || this.eventsDataFormGroup.value.eventType == 'OBVS' || this.eventsDataFormGroup.value.eventType == 'CWC') {
      if (this.categoriesDataFormGroup.value.categories.length == 0) {
        this.uiCommonUtils.showSnackBar("Event should atleast have one category!", "error", 3000);
      }
      else {
        let eventCreationForm: any = {};
        eventCreationForm = { ...this.eventsDataFormGroup.value, ...this.venuesDataFormGroup.value, ...this.categoriesDataFormGroup.value, ...this.questionnaireDataFormGroup.value }
        console.log("this.eventCreationForm", eventCreationForm);
        this.apiService.updateEvent({ data: eventCreationForm }).subscribe((res: any) => {
          if (res.data.status == "success") {
            this.uiCommonUtils.showSnackBar("Event Updated Successfully!", "success", 3000);
          }
          else
            this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
        });
      }
    }
    else if (this.eventsDataFormGroup.value.eventType == 'CWC') {
      if (this.venuesDataFormGroup.value.venues.length == 0) {
        this.uiCommonUtils.showSnackBar("Event should atleast have one venue!", "error", 3000);
      }
      else {
        let eventCreationForm: any = {};
        eventCreationForm = { ...this.eventsDataFormGroup.value, ...this.venuesDataFormGroup.value, ...this.categoriesDataFormGroup.value, ...this.questionnaireDataFormGroup.value }
        console.log("this.eventCreationForm", eventCreationForm);
        this.apiService.updateEvent({ data: eventCreationForm }).subscribe((res: any) => {
          if (res.data.status == "success") {
            this.uiCommonUtils.showSnackBar("Event Updated Successfully!", "success", 3000);
          }
          else
            this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
        });
      }
    }

    this.onCloseBtnClick();
  }

  handleEventFlyerFileInput(event: any) {
    console.log('file uploaded');

  }


  createTtcEvent() {

    if (this.eventsDataFormGroup.value.eventType == 'TTC') {

      let eventCreationForm: any = {};
      eventCreationForm = { ...this.eventsDataFormGroup.value, ...this.venuesDataFormGroup.value, ...this.categoriesDataFormGroup.value, ...this.questionnaireDataFormGroup.value, ...this.ttcExamDataFormGroup.value }
      console.log("this.eventCreationForm", eventCreationForm);
      this.apiService.insertevents({ data: eventCreationForm }).subscribe((res: any) => {
        if (res.data.status == "success") {
          this.uiCommonUtils.showSnackBar("Event Created Successfully!", "success", 3000);
        }
        else
          this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      });
    }

    this.onCloseBtnClick();
  }

  updateTtcEvent() {

    if (this.eventsDataFormGroup.value.eventType == 'TTC') {

      let eventCreationForm: any = {};
      eventCreationForm = { ...this.eventsDataFormGroup.value, ...this.categoriesDataFormGroup.value, ...this.questionnaireDataFormGroup.value, ...this.ttcExamDataFormGroup.value }
      console.log("this.eventCreationForm", eventCreationForm);
      this.apiService.updateEvent({ data: eventCreationForm }).subscribe((res: any) => {
        if (res.data.status == "success") {
          this.uiCommonUtils.showSnackBar("Event Updated Successfully!", "success", 3000);
        }
        else
          this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      });
    }

    //this.onCloseBtnClick();

  }



}
