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
  selector: 'app-profile-search',
  templateUrl: './profile-search.component.html',
  styleUrls: ['./profile-search.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: CustomDateAdapter
    }
  ]
})
export class ProfileSearchComponent implements OnInit {
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





  profileSearchFormGroup: any;
  parishDataList!: any[];
  dioceseData: any = [];
  regionData: any = [];
  parishData: any = [];
  allDioceseRegionParishData: any;
  dropdownSettingsDiocese: any;
  dropdownSettingsRegion: any;
  dropdownSettingsParish: any;
  dropdownSettingsRole: any;
  
  dioceseName!: string;
  regionName!:string ;
  parishName!:string;
  orgId!: string;
  firstName!: string;
  lastName!: string;
  phoneNumber!:string;
  emailId!: string;
  memberId!:string;

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

  dropdownSettingsForRole: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  }
  canSearchByRole: boolean= false;



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

    this.columnDefs = [ ];

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






    this.profileSearchFormGroup = this.formBuilder.group({
      dioceseName: new FormControl('',),
      regionName: new FormControl('',),
      parishName: new FormControl(''),
      memberId: new FormControl('',),
      firstName: new FormControl('',),
      lastName: new FormControl('',),
      phoneNumber: new FormControl('',),
      emailId: new FormControl('', [Validators.email]),
      roles: new FormControl('',),

    });

    this.dropdownSettingsDiocese = this.dropdownSettingsForDiocese;
    this.dropdownSettingsRegion = this.dropdownSettingsForRegion;
    this.dropdownSettingsParish = this.dropdownSettingsForParish;
    this.dropdownSettingsRole = this.dropdownSettingsForRole;

    this.canSearchByRole = this.uiCommonUtils.hasPermissions("can_search_by_role");

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

    })


  }

  onOrgSelectForMultiSelect(event: any) {

    let parishDataArray: any = [];
    for (let row of this.allDioceseRegionParishData) {
      if (event.regionId == row.regionId) {
        for (let row1 of row.parishes) {
          let json = {
            "parishId": row1.parishId,
            "parishName": row1.parishName
          }
          parishDataArray.push(json);
        }
      }
    }
    this.parishData = parishDataArray;

  }


  onSearchClick() {
    
    let payload = {
      "memberFirstName": this.profileSearchFormGroup.value.firstName,
      "memberLastName": this.profileSearchFormGroup.value.lastName,
      "memberPhoneNo": this.profileSearchFormGroup.value.phoneNumber,
      "code": "member_search",
      "extendedSearch": false,
      "parishId": this.profileSearchFormGroup.value.parishName.length == 0 ? "" : this.profileSearchFormGroup.value.parishName[0].parishId,
      "dioceseId": this.profileSearchFormGroup.value.dioceseName.length == 0 ? "" : this.profileSearchFormGroup.value.dioceseName[0].dioceseId,
      "regionId": this.profileSearchFormGroup.value.regionName.length == 0 ? "" : this.profileSearchFormGroup.value.regionName[0].regionId,
      "memberEmailId":  this.profileSearchFormGroup.value.emailId,
      "membershipId":  this.profileSearchFormGroup.value.memberId,
    }

    this.apiService.callPostService(`searchStudents`, payload).subscribe((res) => {
      if (res.data.status == "success") {
        let columnsArray: any = [];
        for(let row of res.data.displayConfig){   
          let json =  { headerName: row.colDisplayName, field: row.colKey, sortable: true, filter: true, suppressSizeToFit: true, flex: 1, resizable: true }
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

  onBtExport() {
    // this.gridApi.exportDataAsExcel();
    const params = {
      columnGroups: true,
      allColumns: true,
      fileName: `filtered_result`,
    };
    this.gridApi.exportDataAsCsv(params);
  }

  clearSearch() {

    this.dioceseName =' ';
    this.regionName= ' ' ;
    this.parishName=' '
    this.memberId=' ';
    this.firstName =' ';
    this.lastName =' ';
    this.phoneNumber= ' ';
    this.emailId =' ';
    this.roles=' ';
    this.profileSearchFormGroup.get('dioceseName').setValue([]);
    this.profileSearchFormGroup.get('regionName').setValue([]);
    this.profileSearchFormGroup.get('parishName').setValue([]);
    this.profileSearchFormGroup.get('roles').setValue([]);
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
    $("#imagemodal").modal("show");
    let rowData = event;
    this.selectedUserData = event.data;
    this.apiService.callGetService(`getRolesByUserId?userId=${this.selectedUserData.userId}`).subscribe((res) => {
      this.rolesData = res.data.roles;

      this.rolesArr = [];
      this.rolesData.forEach((e: any) => {
        if (this.rolesArr.indexOf(e) <= 0) {
  
          for (let i = 0; i < this.orgs.length; i++) {
            if (this.orgs[i].orgtype == e.orgType) {
              e.orgDetails = this.orgs[i].details;
            }
          }
          this.rolesArr.push(e);
        }
      });
      this.updateuserinfo.setControl('roles', this.setRoles(this.rolesData));
    });


    let i = rowData.rowIndex;
    this.userId = this.selectedUserData.userId;

    this.apiService.getParishListData().subscribe(res => {
      for (let i = 0; i < res.data.metaData.Parish.length; i++) {
        this.parishList = res.data.metaData.Parish;
      }
    });


    this.updateuserinfo.patchValue({
      title: this.selectedUserData.title,
      firstName: this.selectedUserData.firstName,
      middleName: this.selectedUserData.middleNmae,
      lastName: this.selectedUserData.lastName,
      nickName: this.selectedUserData.nickName,
      baptismalName: this.selectedUserData.baptismalName,
      dob: this.selectedUserData.dob,
      mobileNo: this.selectedUserData.mobileNo,
      homePhoneNo: this.selectedUserData.homePhoneNo,
      emailAddress: this.selectedUserData.emailId,
      addressLine1: this.selectedUserData.addressLine1,
      addressLine2: this.selectedUserData.addressLine2,
      addressLine3: this.selectedUserData.addressLine3,
      city: this.selectedUserData.city,
      postalCode: this.selectedUserData.postalCode,
      state: this.selectedUserData.state,
      country: this.selectedUserData.country,
      parish: this.selectedUserData.parish_name,
      maritalStatus: this.selectedUserData.maritalStatus,
      dateofMarriage: this.selectedUserData.dateofMarriage,
      aboutYourself: this.selectedUserData.aboutYourself,
      isFamilyHead: this.selectedUserData.isFamilyHead,
    
    })

    this.patchCountryState(this.selectedUserData.country);

    this.selectedUserRole = this.selectedUserData.roles;
   
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
      // console.log("Users for Delete", selectedRows[i].userId);
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
