import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ApiService } from 'src/app/services/api.service';
import { uiCommonUtils } from '../../common/uiCommonUtils';
import { DatePickerRendererComponent } from '../renderers/date-picker-renderer/date-picker-renderer.component'
import { EventBulkRegistration } from '../event-bulk-registration/event-bulk-registration.dataService';


@Component({
  selector: 'app-bulk-registration',
  templateUrl: './bulk-registration.component.html',
  styleUrls: ['./bulk-registration.component.css']
})
export class BulkRegistrationComponent implements OnInit {

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
  dropdownSettingsParishName: any;
  parishNameData: any;
  parishDetailsFormGroup: any;


  isVenueRequired: any;
  isCategoryRequired: any;
  isSchoolGroupRequired: any;
  isQuestionnaireRequired: any;
  isAttachmentRequired: any;
  isSingleDayEvent: any;


  constructor(private router: Router, private apiService: ApiService, private formBuilder: FormBuilder,
    private uiCommonUtils: uiCommonUtils, private eventBulkDataService: EventBulkRegistration) { }


  dropdownSettingsForParishName: IDropdownSettings = {
    singleSelection: true,
    idField: 'orgId',
    textField: 'orgName',
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

    if (this.eventBulkDataService.getSelectedRowData() != undefined) {
      this.selectedRowJson = this.eventBulkDataService.getSelectedRowData();
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson));
    }

    this.dropdownSettingsVenues = this.dropdownSettingsForVenues;
    this.dropdownSettingsParishName = this.dropdownSettingsForParishName;

    this.venuesDataFormGroup = this.formBuilder.group({
      venues: new FormControl('')
    });

    this.parishDetailsFormGroup = this.formBuilder.group({
      parishName: new FormControl('')
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
      this.parishNameData = this.eventData.staffData;

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

      this.parishDetailsFormGroup.patchValue({
        parishName: [this.staffData]
      });

      this.principalName = this.staffData.sundaySchools[0].principalName;
      this.principalEmailId = this.staffData.sundaySchools[0].principalEmailId;
      this.principalMobileNo = this.staffData.sundaySchools[0].principalMobileNo;

      this.parishNameSelChange({ orgId: this.staffData.orgId });
    });

  }

  getColDef() {

    return this.columnDefs = [
      { headerName: 'Participant Name', field: 'staffName', resizable: true, width: 330, sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true },
      { headerName: 'Grade', field: 'grade', width: 150, resizable: true, sortable: true, filter: true },
      { headerName: 'Registration Id', field: 'registrationId', width: 150, resizable: true, sortable: true, filter: true },
      { headerName: 'Registration Status', field: 'registrationStatus', width: 200, resizable: true, sortable: true, filter: true, },
      { headerName: 'Registered By', field: 'registeredBy', width: 150, resizable: true, sortable: true, filter: true },
      {
        headerName: 'Registered On', field: 'registeredOn', width: 200, resizable: true, sortable: true, filter: true,
        cellRenderer: (data: any) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
    ];
  }



  onCancelClick() {
    this.router.navigate(['/dashboard/eventBulkRegistration']);
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
        "staffId": row.staffId,
        "evePartiRegId": row.evePartiRegId == null ? undefined : row.evePartiRegId
      }
      staffRegistration.push(tempArray);
    }

    let payload = {

      "eventId": this.eventId,
      "eventType": this.selectedRowJson.event_type,
      "regMethod": "bulk",
      "eventVenueId": this.venuesDataFormGroup.value.venues[0].eventVenueId,
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


  parishNameSelChange(event: any) {


    for (let row of this.eventData.staffData) {
      if (event.orgId == row.orgId) {

        if (row.sundaySchools.length > 0) {

          this.regGridApi.setRowData(row.sundaySchools[0].staff);

          this.regGridApi.forEachNode(
            (node: any) => {
              if (node.data.hasRegistered !== null)
                node.setSelected(node.data.hasRegistered)
            });

          this.principalName = row.sundaySchools[0].principalName;
          this.principalEmailId = row.sundaySchools[0].principalEmailId;
          this.principalMobileNo = row.sundaySchools[0].principalMobileNo;

        }
        else {
          this.rowData = [];
          this.principalName = "";
          this.principalEmailId = "";
          this.principalMobileNo = "";
        }
      }
    }


  }

}
