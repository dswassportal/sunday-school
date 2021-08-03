import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ApiService } from 'src/app/services/api.service';
import { uiCommonUtils } from '../../common/uiCommonUtils';
import { DatePickerRendererComponent } from '../renderers/date-picker-renderer/date-picker-renderer.component'
import { EventExamRegistration } from '../event-exam-registration/event-exam-registration.dataService';
import { AnonymousSubject } from 'rxjs/internal/Subject';


@Component({
  selector: 'app-exam-registration',
  templateUrl: './exam-registration.component.html',
  styleUrls: ['./exam-registration.component.css']
})
export class ExamRegistrationComponent implements OnInit {

  venuesDataFormGroup: any;
  eventData: any = {};
  eventEndDate: any;
  eventStartDate: any;
  regEndDate: any;
  columnDefs!: any[];
  gridOptions: any;
  rowData: any = [];
  partIds!: any[];
  rowDataBinding: any = [];
  selectedRowJson: any = {};
  selectedUserIds: any = [];
  ttcFormGroup: any;
  isTtcEvent: any;
  venueList: any = [];
  dropdownSettingsVenues: any;
  dropdownSettingsMembers: any;
  dropdownSettingsSchoolGrade: any;
  userMetaData: any;
  loggedInUser: any;
  eventId: any;
  currentURL: any;
  selectedEventType: any;
  regGridApi: any;
  isCancelRegiBtnRequired: any;
  staffData: any;
  principalName: any;
  principalEmailId: any;
  principalMobileNo: any;
  dropdownSettingsSchoolName: any;
  schoolNameData: any;
  parishDetailsFormGroup: any;
  gradesData: any;


  isVenueRequired: any;
  isCategoryRequired: any;
  isSchoolGroupRequired: any;
  isQuestionnaireRequired: any;
  isAttachmentRequired: any;
  isSingleDayEvent: any;


  constructor(private router: Router, private apiService: ApiService, private formBuilder: FormBuilder,
    private uiCommonUtils: uiCommonUtils, private eventExamRegistration: EventExamRegistration) { }

  dropdownSettingsForSchoolName: IDropdownSettings = {
    singleSelection: true,
    idField: 'schoolId',
    textField: 'schoolName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForSchoolGrade: IDropdownSettings = {
    singleSelection: true,
    idField: 'schoolGrade',
    textField: 'schoolGrade',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForVenues: IDropdownSettings = {
    singleSelection: true,
    idField: 'eventVenueId',
    textField: 'name',
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

    this.columnDefs = this.getColDef();

    if (this.eventExamRegistration.getSelectedRowData() != undefined) {
      this.selectedRowJson = this.eventExamRegistration.getSelectedRowData();
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson));
    }

    this.dropdownSettingsVenues = this.dropdownSettingsForVenues;
    this.dropdownSettingsSchoolName = this.dropdownSettingsForSchoolName;
    this.dropdownSettingsSchoolGrade = this.dropdownSettingsForSchoolGrade;

    this.venuesDataFormGroup = this.formBuilder.group({
      venues: new FormControl('')
    });

    this.parishDetailsFormGroup = this.formBuilder.group({
      schoolName: new FormControl(''),
      schoolGrade: new FormControl('')
    });

    this.ttcFormGroup = this.formBuilder.group({

    });

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.eventId = this.selectedRowJson.event_Id;

    this.apiService.callGetService(`getuserRecords?eventId=${this.selectedRowJson.event_Id}&type=ttc_reg_add_participants`).subscribe((res) => {
      this.partIds = res.data.metaData;
      this.rowDataBinding = res.data.metaData;
    });

    this.apiService.callGetService(`getEventDef?eventId=${this.selectedRowJson.event_Id}&participantId=${this.loggedInUser}&regMethod=bulk`).subscribe((res) => {
      this.eventData = res.data.eventData;
      this.venueList = res.data.eventData.venues;

      this.venuesDataFormGroup.patchValue({
        venues: res.data.eventData.selectedVenue
      });


      this.regEndDate = this.eventData.regEndDate;
      this.eventStartDate = this.eventData.eventStartDate;
      this.eventEndDate = this.eventData.eventEndDate;
      this.regEndDate = new Date(this.regEndDate).toLocaleDateString("en-us");
      this.eventStartDate = new Date(this.eventStartDate).toLocaleDateString("en-us");
      this.eventEndDate = new Date(this.eventEndDate).toLocaleDateString("en-us");

      this.isVenueRequired = this.eventData.sectionConfig.isVenueRequired;
      this.isCategoryRequired = this.eventData.sectionConfig.isCategoryRequired;
      this.isSchoolGroupRequired = this.eventData.sectionConfig.isSchoolGroupRequired;
      this.isQuestionnaireRequired = this.eventData.sectionConfig.isQuestionnaireRequired;
      this.isAttachmentRequired = this.eventData.sectionConfig.isAttachmentRequired;
      this.isSingleDayEvent = this.eventData.sectionConfig.isSingleDayEvent;

      if (this.eventData.registrationStatus == "Registered" && this.selectedEventType === 'registered_events') {
        this.isCancelRegiBtnRequired = true;
      }
      else {
        this.isCancelRegiBtnRequired = false;
      }

      for (let row of this.eventData.staffData) {
        if (row.orgId == this.userMetaData.orgId) {
          this.staffData = row;
        }
      }

      this.principalName = this.staffData.sundaySchools[0].principalName;
      this.principalEmailId = this.staffData.sundaySchools[0].principalEmailId;
      this.principalMobileNo = this.staffData.sundaySchools[0].principalMobileNo;

      const newArray = [...this.eventData.studentsData.reduce((map: any, obj: any) => map.set(obj.schoolGrade, obj), new Map()).values()];
      newArray.splice(0, 0 , {
        "schoolGrade": "All Grades"
      });
      
      this.gradesData = newArray;
      this.schoolNameData = this.eventData.schools;
      this.regGridApi.setRowData(this.eventData.studentsData);
      //this.parishNameSelChange({ orgId: this.staffData.orgId });

      this.regGridApi.forEachNode(
        (node: any) => {
          if (node.data.hasSelected !== null)
            node.setSelected(node.data.hasSelected)
        });
    });

  }


  schoolGradeSelChange(event: any) {
    let newStudentsData = [];
    for (let row of this.eventData.studentsData) {
      if (row.schoolGrade == event.schoolGrade) {
        for (let row1 of this.eventData.schools) {
          if (row1.schoolId == this.parishDetailsFormGroup.value.schoolName[0].schoolId) {
            newStudentsData.push(row);
          }
        }
      }
    }
    this.regGridApi.setRowData(newStudentsData);
    if(event.schoolGrade == "All Grades"){
      this.regGridApi.setRowData(this.eventData.studentsData);
    }
  }

  getColDef() {

    return this.columnDefs = [
      { headerName: 'Student Name', field: 'studentName', resizable: true, width: 330, sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true },
      { headerName: 'Grade', field: 'schoolGrade', width: 150, resizable: true, sortable: true, filter: true },
      { headerName: 'Teacher Name', field: 'staffName', width: 250, resizable: true, sortable: true, filter: true, },
      { headerName: 'Registration Id', field: 'registrationId', width: 150, resizable: true, sortable: true, filter: true },
      { headerName: 'Registered By', field: 'registeredBy', width: 150, resizable: true, sortable: true, filter: true },
      {
        headerName: 'Registered On', field: 'registeredOn', width: 200, resizable: true, sortable: true, filter: true,
        cellRenderer: (data: any) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      { headerName: 'Registration Status', field: 'registrationStatus', width: 200, resizable: true, sortable: true, filter: true, },
    ];
  }




  onCancelClick() {
    this.router.navigate(['/dashboard/eventExamRegistration']);
  }

  onUpdateRegistrationClick() {

  }

  onRegisterEventClick() {


    let allRegGridData = this.regGridApi.getSelectedRows();
    //this.eventData.staffData[0].sundaySchools[0].staff;

    let staffRegistration: any = [];
    for (let row of allRegGridData) {
      let tempArray =
      {
        "staffId": row.studentId,
        "evePartiRegId": row.evePartiRegId
      }
      staffRegistration.push(tempArray);
    }

    let payload = {

      "eventId": this.eventId,
      "eventType": this.selectedRowJson.event_type,
      "regMethod": "bulk",
      "eventVenueId": this.venuesDataFormGroup.value.venues.length == 0 ? null : this.venuesDataFormGroup.value.venues[0].eventVenueId,
      "staffRegistration": staffRegistration

    }


    this.apiService.callPostService('registerEvent', payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        this.uiCommonUtils.showSnackBar("Registered for event successfully!", "success", 3000);
      }
      else
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
    });

  }

  onCancelRegistrationClick() {

  }


  //miscellaneous
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }



  onRegGridReady(params: any) {
    this.regGridApi = params.api;


  }


  // parishNameSelChange(event: any) {



  //   for (let row of this.eventData.staffData) {
  //     if (event.orgId == row.orgId) {

  //       if (row.sundaySchools.length > 0) {

  //         this.regGridApi.setRowData(row.sundaySchools[0].staff);

  //         this.regGridApi.forEachNode(
  //           (node: any) => {
  //             if (node.data.hasRegistered !== null)
  //               node.setSelected(node.data.hasRegistered)
  //           });

  //         this.principalName = row.sundaySchools[0].principalName;
  //         this.principalEmailId = row.sundaySchools[0].principalEmailId;
  //         this.principalMobileNo = row.sundaySchools[0].principalMobileNo;

  //       }
  //       else {
  //         this.rowData = [];
  //         this.principalName = "";
  //         this.principalEmailId = "";
  //         this.principalMobileNo = "";
  //       }
  //     }
  //   }


  // }

}
