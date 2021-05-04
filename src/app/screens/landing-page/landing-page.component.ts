import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ButtonRendererComponent } from '../renderers/button-renderer/button-renderer.component';
import { GridOptions, GridApi } from "ag-grid-community";
import { AgGridAngular } from "ag-grid-angular";
import { uiCommonUtils } from '../../common/uiCommonUtils';
declare let $: any;

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})


export class LandingPageComponent implements OnInit {

  // @ViewChild('agGrid') agGrid: AgGridAngular;
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
  parishList!: any[];
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
  homePhoneNumber: any;
  alluserdata: any;
  minDate = new Date();

  constructor(private apiService: ApiService, private uiCommonUtils: uiCommonUtils,
    private http: HttpClient, private formBuilder: FormBuilder) { }
  // this.gridOptions = <GridOptions>{};

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
      middleName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      nickName: new FormControl('', Validators.required),
      baptismalName: new FormControl('', Validators.required),
      dob: new FormControl('', [Validators.required]),
      mobileNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      homePhoneNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      emailAddress: new FormControl('',[Validators.required, Validators.email]),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      addressLine3: new FormControl(''),
      city: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      parish: new FormControl(''),
      maritalStatus: new FormControl('', Validators.required),
      dateofMarriage: new FormControl(''),
      aboutYourself: new FormControl(''),
      isFamilyHead: new FormControl(''),
      roles: this.formBuilder.array([this.adduserroles()], [Validators.required]),
    });

    this.columnDefs = [
      { headerName: 'First Name', field: 'firstName', sortable: true, filter: true, width: 170, checkboxSelection: true },
      { headerName: 'Last Name', field: 'lastName', sortable: true, filter: true, width: 170 },
      { headerName: 'Member Type', field: 'memberType', sortable: true, filter: true, width: 150 },
      { headerName: 'Parish', field: 'parish_name', sortable: true, filter: true, width: 200 },
      { headerName: 'City', field: 'city', sortable: true, filter: true, width: 150 },
      { headerName: 'State', field: 'state', sortable: true, filter: true, width: 150 },
      { headerName: 'Postal Code', field: 'postalCode', sortable: true, filter: true, width: 140 },
      {
        headerName: 'Actions', field: 'action', cellRendererFramework: ButtonRendererComponent, width: 140,
        cellRendererParams: function (params: any) {
          // onClick: this.openModal.bind(this),
          // label: 'Click'
          // `<button>Edit</button>`;
        }, suppressSizeToFit: false
      }
    ];

    this.getUserData();

    this.max_date = new Date;

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();

    this.hasRolePermission = this.uiCommonUtils.hasPermissions("assign_role");

    this.hasDeletePermission = this.uiCommonUtils.hasPermissions("delete_user");
    // if(this.hasDeletePermission == true){
    //   this.hasDeletePermission = false;
    // }

    this.apiService.getUserRoleData().subscribe(res => {
      console.log("User Role Data : ", res.data.metadata);
      this.roledata = res.data.metadata.roles;
      this.orgs = res.data.metadata.orgs;
      console.log("Roles Data:", this.orgs);
    })


    this.apiService.getUsersData({ data: this.userRecords }).subscribe((res) => {
      console.log('These are users from database : ');
     console.log(res.data.metaData);
   this.alluserdata = res.data.metaData;
   });

    this.apiService.getCountryStates().subscribe((res: any) => {
      this.countries = res.data.countryState;
      console.log("Countries", this.countries);
    })

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

  getMobileNumber(event: any) {
    console.log(event);
    this.mobileNumber = event;
  }

  getHomePhoneNumber(event: any) {
    this.homePhoneNumber = event;
  }

  resetForm() {
    this.updateuserinfo.reset();
  }

  openModal() {
    // this.rowId = event.rowData ? event.rowData._id : "";
    $("#imagemodal").modal("show");
  }

  onRowClicked(event: any) {
    $("#imagemodal").modal("show");

    let rowData = event;
    this.selectedUserData = event.data;
    console.log(this.selectedUserData);
    let i = rowData.rowIndex;
    this.userId = this.selectedUserData.userId;

    this.apiService.getParishListData().subscribe(res => {
      for (let i = 0; i < res.data.metaData.Parish.length; i++) {
        this.parishList = res.data.metaData.Parish;
      }
      console.log(this.parishList);
    })


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
      //  role : selectedUserData.roles[0].roleId,
      //  accesslvltype : selectedUserData.roles[0].orgType,
      //  accesslvlid : selectedUserData.roles[0].orgId  
      // roles: selectedUserData.roles
    })

    this.patchCountryState(this.selectedUserData.country);

    this.selectedUserRole = this.selectedUserData.roles;
    console.log("selectedUserRole", this.selectedUserRole)

    this.rolesArr = [];
    this.selectedUserRole.forEach((e: any) => {
      if (this.rolesArr.indexOf(e) <= 0) {

        for (let i = 0; i < this.orgs.length; i++) {
          if (this.orgs[i].orgtype == e.orgType) {
            e.orgDetails = this.orgs[i].details;
          }
        }
        this.rolesArr.push(e);
      }
    });

    this.updateuserinfo.setControl('roles', this.setRoles(this.selectedUserRole));
  }

  telInputObject(obj: any) {
    obj.intlTelInput('setNumber', this.selectedUserData.mobileNo);
  }

  setRoles(selectedUserRole: any): FormArray {
    const formArray = new FormArray([]);
    this.selectedUserRole.forEach((e: any) => {

      formArray.push(this.formBuilder.group({
        roleId: e.roleId,
        role: e.orgType,
        orgId: e.orgId
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
      orgId: [null, Validators.required]
    });
  }

  onremovebtnclick(index: any) {
    (<FormArray>this.updateuserinfo.get('roles').removeAt(index));
  }

  getUserData() {

    //this.userRecords.loggedInUser = this.loggedInUser;
    this.apiService.getUsersData(this.loggedInUser).subscribe((res) => {
      console.log('These are users from database : ');
      console.log(res.data.metaData);
      this.rowData = res.data.metaData;
    });
  }

  updateUserProfile() {
    if (this.updateuserinfo.invalid) {
      return
    }
    else if (this.updateuserinfo.value.roles.length == 0) {
      this.uiCommonUtils.showSnackBar('User should have atleast one Role', 'Dismiss', 3000);
    }
    else {
      this.updateuserinfo.value.userId = this.userId;
      this.updateuserinfo.value.updatedBy = this.loggedInUser;
      this.updateuserinfo.value.orgId = this.selectedUserData.orgId;
      this.updateuserinfo.value.mobileNo = this.mobileNumber;
      this.updateuserinfo.value.homePhoneNo = this.homePhoneNumber;
      let dob = this.updateuserinfo.value.dob;
      console.log(dob);
      this.apiService.updateUserProfile({ data: this.updateuserinfo.value }).subscribe((res: any) => {
        console.log("User Profile Updated.")
        if (res.data.status = "success") {
          this.uiCommonUtils.showSnackBar('User Profile Updated..', 'Dismiss', 3000)
        }
        this.getUserData();
      })
      this.updateuserinfo.reset();
      $("#imagemodal").modal("hide");

    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onSelectionChanged(event: any) {
    var selectedRows = this.gridApi.getSelectedRows();
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
        this.uiCommonUtils.showSnackBar('User Record Deleted..', 'Dismiss', 3000)
      }
    })
    this.getUserData();
    console.log("Records Deleted...");
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



}
