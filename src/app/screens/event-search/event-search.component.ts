import { Component, OnInit , ViewChild} from '@angular/core';;
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ButtonRendererComponent } from '../renderers/button-renderer/button-renderer.component';
import { GridOptions, GridApi } from "ag-grid-community";
import { AgGridAngular } from "ag-grid-angular";
import { uiCommonUtils } from '../../common/uiCommonUtils';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import {MatAccordion} from '@angular/material/expansion';


declare let $: any;

import { Moment } from 'moment';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject } from 'rxjs';


const moment = _rollupMoment || _moment;

class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = 'MMMM DD YYYY';
    return moment(date).format(formatString);
  }
}

@Component({
  selector: 'app-event-search',
  templateUrl: './event-search.component.html',
  styleUrls: ['./event-search.component.css']
})
export class EventSearchComponent implements OnInit {

  @ViewChild(MatAccordion) accordion!: MatAccordion;



  parishList!: any[];
  Parish!: any[];
  gridOptions: any;
  userRecords: any;
  columnDefs!: any[];
  rowData: any;
  term: any;
  gridApi: any;
  node: any;
  data: any;
  params: any;
  updateuserinfo: any;
  roles: any;
  roledata!: any[];
  orgs!: any[];
  orgDetails!: any;
  item: any;
  userId: any;
  selectedOrg: any;
  max_date!: Date;
  rowId: any;
  selectedUserRole!: any[];
  agGrid: any;
  userMetaData: any;
  deleteUser: any[] = new Array();
  hasRolePermission: Boolean = false;
  hasDeletePermission: Boolean = true;
  hasEditPermission: boolean = false;
  inputObj: any;
  selectedUserData: any;
  loggedInUser: any;
  countries!: any[];
  states!: any[];
  selectedCountry: any;
  mobileNumber: any;
  rolesData: any;
  homePhoneNumber: any;
  alluserdata: any;
  roleEndDateErrorFlag: any;
  minDate = new Date();
  titles!: any[];
  maritalstatus!:any[];
  error = {validatePhoneNumber: true};







  parishSearchFormGroup: any;
  dioceseName!: string;
  regionName!:string ;
  parishName!:string;
  parishDataList!: any[];
  dioceseData: any = [];
  regionData: any = [];
  parishData: any = [];
  eventStatusData: any = [];
  eventCategoryData: any = [];
  eventGroupData: any = [];
  parishOrgData: any = [];
  registrationStatusData: any = [];
  allDioceseRegionParishData: any;
  dropdownSettingEventType: any;
  dropdownSettingsEventStatus: any;
  

  dropdownSettingsDiocese: any;
  dropdownSettingsRegion: any;
  dropdownSettingsParish: any;
  dropdownSettingsEventType: any;
  dropdownSettingsEventCategory: any;
  dropdownSettingsEventGroup: any;
  dropdownSettingsParishOrg: any;
  dropdownSettingsRegistrationStatus: any;
  eventList!: any[];

  dropdownSettingsForDiocese: IDropdownSettings = {
    singleSelection: true,
    idField: 'dioceseId',
    textField: 'dioceseName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForRegion: IDropdownSettings = {
    singleSelection: true,
    idField: 'regionId',
    textField: 'regionName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForParish: IDropdownSettings = {
    singleSelection: true,
    idField: 'parishId',
    textField: 'parishName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
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

  dropdownSettingsForEventCategory: IDropdownSettings = {
    singleSelection: true,
    idField: 'catId',
    textField: 'categoryName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForEventGroup: IDropdownSettings = {
    singleSelection: true,
    idField: 'groupId',
    textField: 'groupName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForParishOrg: IDropdownSettings = {
    singleSelection: true,
    idField: 'orgId',
    textField: 'sundaySchoolsName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForRegistrationStatus: IDropdownSettings = {
    singleSelection: true,
    idField: 'status',
    textField: 'status',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };



  constructor(private apiService: ApiService, private uiCommonUtils: uiCommonUtils,
    private http: HttpClient, private formBuilder: FormBuilder, public router: Router) { }

    agInit(params: any) {
      this.params = params;
      this.data = params.value;
    }
  



  ngOnInit(): void {


    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.hasRolePermission = this.uiCommonUtils.hasPermissions("assign_role");
    this.hasDeletePermission = this.uiCommonUtils.hasPermissions("delete_user");

    this.apiService.getEventType().subscribe((res: any) => {
      this.eventList = res.data.metaData.eventType;
      this.eventCategoryData = res.data.metaData.eventCategories;
      this.eventGroupData = res.data.metaData.gradeGroups;
      this.parishOrgData = res.data.metaData.sundaySchools;
      let regStatus = [{
        "status":"Registered"
      },
      {
        "status":"Canceled"
      }
    ];

      this.registrationStatusData = regStatus;
    });

    this.updateuserinfo = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      middleName: new FormControl(''),
      lastName: new FormControl('', Validators.required),
      nickName: new FormControl(''),
      baptismalName: new FormControl(''),
      dob: new FormControl(''),
      //mobileNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      mobileNo: new FormControl(''),
      homePhoneNo: new FormControl(''),
      emailAddress: new FormControl('', [Validators.email]),
      addressLine1: new FormControl(''),
      addressLine2: new FormControl(''),
      addressLine3: new FormControl(''),
      city: new FormControl(''),
      postalCode: new FormControl(''),
      state: new FormControl(''),
      country: new FormControl(''),
      parish: new FormControl(''),
      maritalStatus: new FormControl(''),
      dateofMarriage: new FormControl(''),
      aboutYourself: new FormControl(''),
      isFamilyHead: new FormControl(''),
      roles: this.formBuilder.array([this.adduserroles()]),
    });

    this.columnDefs = [
    ];
    // { headerName: 'Parish Name', field: '', sortable: true, filter: true, width: 200, checkboxSelection: true },
    // { headerName: 'Address', field: '', sortable: true, filter: true, width: 200 },
    // { headerName: 'Region Name', field: '', sortable: true, filter: true, width: 200 },
    // { headerName: 'Phone Number', field: '', sortable: true, filter: true, width: 200 },
    // { headerName: 'Email Address', field: '', sortable: true, filter: true, width: 200 },

    //this.getUserData();
    this.rowData = [];

    this.max_date = new Date;

    
    this.max_date = new Date;

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();

    this.hasRolePermission = this.uiCommonUtils.hasPermissions("assign_role");

    this.hasDeletePermission = this.uiCommonUtils.hasPermissions("delete_user");


    this.apiService.callGetService('getRoleMetaData').subscribe(res => {
      console.log("User Role Data : ", res.data.metadata);
      this.roledata = res.data.metadata.roles;
      this.orgs = res.data.metadata.orgs;
      console.log("Roles Data:", this.orgs);
    })

    this.apiService.callGetService('getLookupMasterData?types=title,martial status').subscribe((res: any) => {
      this.titles = res.data["titles"];
      this.maritalstatus =res.data["martial statuss"];
    
    });

    this.apiService.callGetService('getCountryStates').subscribe((res: any) => {
      this.countries = res.data.countryState;
    });
    this.gridOptions = {
      columnDefs: this.columnDefs,
      rowData: this.rowData,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };    



    this.parishSearchFormGroup = this.formBuilder.group({
      dioceseName: new FormControl(''),
      regionName: new FormControl(''),
      parishName: new FormControl(''),
      parishOrganization: new FormControl(''),
      eventType : new FormControl(''),
      eventName: new FormControl(''),
      eventStatus: new FormControl(''),
      eventCategory: new FormControl(''),
      eventGroup: new FormControl(''),
      partfirstName: new FormControl(''),
      partLastName: new FormControl(''),
      partRole: new FormControl(''),
      registrationId: new FormControl(''),
      registeredBy: new FormControl(''),
      registrationStatus: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      regStartDate: new FormControl(''),
      regEndDate: new FormControl(''),
    });
    this.dropdownSettingsDiocese = this.dropdownSettingsForDiocese;
    this.dropdownSettingsRegion = this.dropdownSettingsForRegion;
    this.dropdownSettingsParish = this.dropdownSettingsForParish;
    this.dropdownSettingsEventType = this.dropdownSettingForEventType;
    this.dropdownSettingsEventCategory = this.dropdownSettingsForEventCategory;
    this.dropdownSettingsEventGroup = this.dropdownSettingsForEventGroup;
    this.dropdownSettingsParishOrg = this.dropdownSettingsForParishOrg;
    this.dropdownSettingsRegistrationStatus = this.dropdownSettingsForRegistrationStatus;
    this.apiService.callGetService('getRegionAndParish').subscribe((res: any) => {
      this.allDioceseRegionParishData = res.data.metaData.regions;
      let dioceseArray = [];
      for (let row of res.data.metaData.regions) {
        if(row.regionId == 1){
          let Json = {
            "dioceseId": row.regionId,
            "dioceseName": row.regionName
          }
          dioceseArray.push(Json);
          this.dioceseData = dioceseArray;
        }
       
      }

      // this.searchFormGroup.patchValue({
      //   dioceseName: this.dioceseData
      // })

      let regionDataArray: any = [];
      for (let row of res.data.metaData.regions) {
        if (row.regionId != 1) {
          let json = {
            "regionId": row.regionId,
            "regionName": row.regionName
          }
          regionDataArray.push(json);
        }
      }
      this.regionData = regionDataArray;

      let parishDataArray: any = [];
      for (let row of res.data.metaData.allParishes) {
            let json = {
              "parishId": row.parishId,
              "parishName": row.parishName
            }
            parishDataArray.push(json);
        }
      this.parishData = parishDataArray;


    })
   
  }

  onBtExport() {
    // this.gridApi.exportDataAsExcel();
    const params = {
      columnGroups: true,
      allColumns: true,
      fileName: `Parish_Search_Result`,
    };
    this.gridApi.exportDataAsCsv(params);
  }

  onOrgSelectForMultiSelect(event: any) {

    // let parishDataArray: any = [];
    // for (let row of this.allDioceseRegionParishData) {
    //   if (event.regionId == row.regionId) {
    //     for (let row1 of row.parishes) {
    //       let json = {
    //         "parishId": row1.parishId,
    //         "parishName": row1.parishName
    //       }
    //       parishDataArray.push(json);
    //     }
    //   }
    // }
    // this.parishData = parishDataArray;

  }

  onSearchClick() {
    
    let code!: string;
    if(this.parishSearchFormGroup.value.eventType[0].eventType == "CWC" || this.parishSearchFormGroup.value.eventType[0].eventType == 'Talent Competition' || this.parishSearchFormGroup.value.eventType[0].eventType == 'Talent Show'){
        code = 'event_search_cwc';
    }
    if(this.parishSearchFormGroup.value.eventType[0].eventType == "OVBS" || this.parishSearchFormGroup.value.eventType[0].eventType == "Bible Reading"){
      code = 'event_search_ovbs';
    }
    if(this.parishSearchFormGroup.value.eventType[0].eventType == "Sunday School Midterm Exam"){
      code = 'event_search_ss_midterm_exam';
    }
    if(this.parishSearchFormGroup.value.eventType[0].eventType == "Sunday School Final Exam" || this.parishSearchFormGroup.value.eventType[0].eventType == "Diploma Exam"){
      code = 'event_search_ss_finalterm_exam';
    }
    if(this.parishSearchFormGroup.value.eventType[0].eventType == "TTC"){
      code = 'event_search_ttc_exam';
    }
    if(this.parishSearchFormGroup.value.eventType[0].eventType == "Teachers Training"){
      code = 'event_search_teachers_training';
    }

    let payload = {
      
      "code": code,
      "extendedSearch": false,
      "parishId": this.parishSearchFormGroup.value.parishName.length == 0 ? "" : this.parishSearchFormGroup.value.parishName[0].parishId,
      "dioceseId": this.parishSearchFormGroup.value.dioceseName.length == 0 ? "" : this.parishSearchFormGroup.value.dioceseName[0].dioceseId,
      "regionId": this.parishSearchFormGroup.value.regionName.length == 0 ? "" : this.parishSearchFormGroup.value.regionName[0].regionId,
      "parishOrganization": this.parishSearchFormGroup.value.parishOrganization.length == 0 ? "" : this.parishSearchFormGroup.value.parishOrganization[0].orgId,
      "eventType" : this.parishSearchFormGroup.value.eventType[0].eventType,
      "eventName": this.parishSearchFormGroup.value.eventName,
      "eventStatus": this.parishSearchFormGroup.value.eventStatus,
      "eventCategory": this.parishSearchFormGroup.value.eventCategory.length == 0 ? "" : this.parishSearchFormGroup.value.eventCategory[0].categoryName,
      "eventGroup":  this.parishSearchFormGroup.value.eventGroup.length == 0 ? "" : this.parishSearchFormGroup.value.eventGroup[0].groupName,
      "partfirstName": this.parishSearchFormGroup.value.partfirstName,
      "partLastName": this.parishSearchFormGroup.value.partLastName,
      "partRole": this.parishSearchFormGroup.value.partRole,
      "registrationId": this.parishSearchFormGroup.value.registrationId,
      "registeredBy": this.parishSearchFormGroup.value.registeredBy,
      "registrationStatus": this.parishSearchFormGroup.value.registrationStatus.length == 0 ? "" : this.parishSearchFormGroup.value.registrationStatus[0].status,
      "startDate": this.parishSearchFormGroup.value.startDate,
      "endDate": this.parishSearchFormGroup.value.endDate,
      "regStartDate": this.parishSearchFormGroup.value.regStartDate,
      "regEndDate": this.parishSearchFormGroup.value.regEndDate,
    }

    this.apiService.callPostService(`searchStudents`, payload).subscribe((res) => {
      if (res.data.status == "success") {
        let columnsArray: any = [];
        for(let row of res.data.displayConfig){   
          let json =  { headerName: row.colDisplayName, field: row.colKey, sortable: true, filter: true, width:200,
            // cellRenderer: (data: any) => {
            //   return data.value ? (new Date(data.value)).toLocaleDateString() : '';
            // },
           }
          columnsArray.push(json);
        } 
        this.columnDefs = columnsArray;
        this.rowData = res.data.result;
      }
      else{
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      }
    });
  }
  clearSearch() {

    
    this.parishSearchFormGroup.get('dioceseName').setValue([]);
    this.parishSearchFormGroup.get('regionName').setValue([]);
    this.parishSearchFormGroup.get('parishName').setValue([]);
    
}


isStateDataSet = false;
  keyPress(event: any) {
    this.isStateDataSet = false;
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 5 && !pattern.test(inputChar)) {
      event.preventDefault();
      if (event.keyCode == 13) {
        //this.change(event);
        console.log("keyCode == 13");
      }
    }
  }
  cancel() {
    this.router.navigate(['/dashboard/']);
  }



//Role End Date Validator that is roleEndDate>roleStartDate
comparisonRegiEnddateValidator(): any {
  let regiStartDate = this.updateuserinfo.value.roles['roleStartDate'];
  let regiEndDate = this.updateuserinfo.value.roles['roleEndDate'];

  let startnew = new Date(regiStartDate);
  let endnew = new Date(regiEndDate);

  if (startnew > endnew) {
    return this.updateuserinfo.controls['roles'].setErrors({ 'invaliddaterange': true });
  }
}

checkValid() {
  if(this.parishSearchFormGroup.get('dioceseName').valid || this.parishSearchFormGroup.get('regionName').valid || this.parishSearchFormGroup.get('parishName').valid) {
    return false;
  } else {
    return true;
  }
}

setRoles(selectedUserRole: any): FormArray {
  const formArray = new FormArray([]);
  selectedUserRole.forEach((e: any) => {

    formArray.push(this.formBuilder.group({
      roleId: e.roleId,
      role: e.orgType,
      orgId: e.orgId,
      roleStartDate: e.roleStartDate,
      roleEndDate: e.roleEndDate
    }));

    this.onOrgSelect({
      "target": {
        "value": e.orgType
      }
    });
  });
  return formArray;
}

onOrgSelect(event: any) {
  console.log(event);
  // console.log("Org Name", event.target.value);
  this.selectedOrg = event.target.value;
  let orgIndex = event.target.id;
  if (orgIndex == undefined)
    orgIndex = 0;
  else
    orgIndex = parseInt(orgIndex)
  console.log("Dropdown Index:", orgIndex);

  for (let i = 0; i < this.orgs.length; i++) {
    if (this.orgs[i].orgtype == this.selectedOrg) {
      this.rolesArr[orgIndex].orgDetails = this.orgs[i].details;
      this.orgDetails = this.orgs[i].details;
    }
  }

  // const select = this.orgs.find(_ => _.type == type);
  // return select ? select.values : select;
}


getOrgDetailsArrByindex(i: any) {
  // console.log('i======>' + i);
  // console.log('this.rolesArr:' + this.rolesArr.length)
  if (this.rolesArr.length == 0)
    return this.orgDetails
  else {
    if (i > (this.rolesArr.length - 1)) {
      //  console.log('Returning []');
      return []
    }
    else {
      //  console.log('Returning ' + this.rolesArr[i].orgDetails)
      return this.rolesArr[i].orgDetails;
    }
  }
}

rolesArr: any[] = [];

onaddbtnclick() {
  this.roles = this.updateuserinfo.get('roles') as FormArray;
  this.roles.push(this.adduserroles());
}

adduserroles(): FormGroup {
  this.rolesArr.push({});
  return this.formBuilder.group({
    roleId: [null, Validators.required],
    role: [null, Validators.required],
    orgId: [null, Validators.required],
    roleStartDate: [null],
    roleEndDate: [null ]
  });
}

onremovebtnclick(index: any) {
  (<FormArray>this.updateuserinfo.get('roles').removeAt(index));
}


  getUserData() {

    //this.userRecords.loggedInUser = this.loggedInUser;
    this.apiService.callGetService('getuserRecords?type=approved').subscribe((res) => {
      this.rowData = res.data.metaData;
    });
  }

  updateUserProfile() {
    if (this.updateuserinfo.invalid) {
      this.uiCommonUtils.showSnackBar("Please fill out all required fields!", "error", 3000);
    }
    else 
    if (this.updateuserinfo.value.roles.length == 0) {
      this.uiCommonUtils.showSnackBar("User should have atleast one Role!", "error", 3000);
    }
    else {
      this.updateuserinfo.value.userId = this.userId;
      this.updateuserinfo.value.updatedBy = this.loggedInUser;
      this.updateuserinfo.value.orgId = this.selectedUserData.orgId;
      //this.updateuserinfo.value.mobileNo = this.mobileNumber;
      //this.updateuserinfo.value.homePhoneNo = this.homePhoneNumber;
      let dob = this.updateuserinfo.value.dob;
      this.apiService.callPostService(`updateUserRoles`, this.updateuserinfo.value ).subscribe((res: any) => {
        if (res.data.status = "success") {
          this.uiCommonUtils.showSnackBar("User Profile Updated Successfully!", "success", 3000);
        }
        this.getUserData();
      })
      this.updateuserinfo.reset();
      $("#imagemodal").modal("hide");

    }
  }

  openModal() {
    // this.rowId = event.rowData ? event.rowData._id : "";
    $("#imagemodal").modal("show");
  }
  
  onRowClicked(event: any) {
    // $("#imagemodal").modal("show");
    // let rowData = event;
    // this.selectedUserData = event.data;
    // this.apiService.callGetService(`getRolesByUserId?userId=${this.selectedUserData.userId}`).subscribe((res) => {
    //   this.rolesData = res.data.roles;

    //   this.rolesArr = [];
    //   this.rolesData.forEach((e: any) => {
    //     if (this.rolesArr.indexOf(e) <= 0) {
  
    //       for (let i = 0; i < this.orgs.length; i++) {
    //         if (this.orgs[i].orgtype == e.orgType) {
    //           e.orgDetails = this.orgs[i].details;
    //         }
    //       }
    //       this.rolesArr.push(e);
    //     }
    //   });
    //   this.updateuserinfo.setControl('roles', this.setRoles(this.rolesData));
    // });


    // let i = rowData.rowIndex;
    // this.userId = this.selectedUserData.userId;

    // this.apiService.getParishListData().subscribe(res => {
    //   for (let i = 0; i < res.data.metaData.Parish.length; i++) {
    //     this.parishList = res.data.metaData.Parish;
    //   }
    // });


    // this.updateuserinfo.patchValue({
    //   title: this.selectedUserData.title,
    //   firstName: this.selectedUserData.firstName,
    //   middleName: this.selectedUserData.middleNmae,
    //   lastName: this.selectedUserData.lastName,
    //   nickName: this.selectedUserData.nickName,
    //   baptismalName: this.selectedUserData.baptismalName,
    //   dob: this.selectedUserData.dob,
    //   mobileNo: this.selectedUserData.mobileNo,
    //   homePhoneNo: this.selectedUserData.homePhoneNo,
    //   emailAddress: this.selectedUserData.emailId,
    //   addressLine1: this.selectedUserData.addressLine1,
    //   addressLine2: this.selectedUserData.addressLine2,
    //   addressLine3: this.selectedUserData.addressLine3,
    //   city: this.selectedUserData.city,
    //   postalCode: this.selectedUserData.postalCode,
    //   state: this.selectedUserData.state,
    //   country: this.selectedUserData.country,
    //   parish: this.selectedUserData.parish_name,
    //   maritalStatus: this.selectedUserData.maritalStatus,
    //   dateofMarriage: this.selectedUserData.dateofMarriage,
    //   aboutYourself: this.selectedUserData.aboutYourself,
    //   isFamilyHead: this.selectedUserData.isFamilyHead,
    
    // })

    // this.patchCountryState(this.selectedUserData.country);

    // this.selectedUserRole = this.selectedUserData.roles;
   
  }

  changeCountry(country: any) {
    //this.states = this.countries.find((cntry: any) => cntry.name == country.target.value).states;
    for (let i = 0; i < this.countries.length; i++) {
      if (this.countries[i].countryName == country.target.value) {
        console.log(this.countries[i].states);
        this.states = this.countries[i].states;
      }
    }
  }
  patchCountryState(country: any) {
    //this.states = this.countries.find((cntry: any) => cntry.name == country.target.value).states;
    for (let i = 0; i < this.countries.length; i++) {
      if (this.countries[i].countryName == country) {
        console.log(this.countries[i].states);
        this.states = this.countries[i].states;
      }
    }
  }

  onDelete() {

    let selectedRows = this.gridApi.getSelectedRows();
    for (let i = 0; i < selectedRows.length; i++) {
      console.log("Users for Delete", selectedRows[i].userId);
      this.deleteUser.push(selectedRows[i].userId);
      //this.deleteUser = selectedRows[i].userId;
    }

    console.log("Users for Delete", this.deleteUser);
    let payload = {
      "data": {
        "deleteUser": this.deleteUser
      }
    }
    this.apiService.deleteUser(payload).subscribe((res: any) => {
      if (res.data.status = "success") {
        this.uiCommonUtils.showSnackBar("User Record Deleted Successfully!", "success", 3000);
      }
    })
    this.getUserData();
    console.log("Records Deleted...");
  }

  onSearchChange(event: any) {
    this.gridApi.setQuickFilter(this.term);
  }

  resetForm() {
    this.updateuserinfo.reset();
  }



  onGridReady(params: any) {
    this.gridApi = params.api;
  }
  
    onSelectionChanged(event: any) {
      var selectedRows = this.gridApi.getSelectedRows();
    }

      //miscellaneous
      onItemSelect(item: any) {
        console.log(item);
      }
      onSelectAll(items: any) {
        console.log(items);
      }
}
