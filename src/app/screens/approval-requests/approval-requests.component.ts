import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormControl, Validators, FormBuilder } from '../../../../node_modules/@angular/forms';
import { Router } from '../../../../node_modules/@angular/router';
import { ReqRendererComponent } from '../../screens/renderers/req-renderer/req-renderer.component';
import { uiCommonUtils } from '../../common/uiCommonUtils';
declare let $: any;

import { Moment } from 'moment';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';

const moment = _rollupMoment || _moment;


class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = ' MMMM DD YYYY';
    return moment(date).format(formatString);
  }
}


@Component({
  selector: 'app-approval-requests',
  templateUrl: './approval-requests.component.html',
  styleUrls: ['./approval-requests.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: CustomDateAdapter
    }
  ]
  })
export class ApprovalRequestsComponent implements OnInit {

  data: any;
  params: any;
  columnDefs: any;
  rowData: any;
  term: any;
  userRecords!: any[];
  selectedUserData: any;
  approveReqForm: any;
  reqDisableForm: any;
  userMetaData: any;
  isApproved: boolean = true;
  loggedInUser: any;
  parishList!: any[];
  countries!: any[];
  states!: any[];
  selectedCountry: any;
  gridApi: any;

  constructor(private apiService: ApiService, private formBuilder: FormBuilder,
    private uiCommonUtils: uiCommonUtils, private router: Router) { }

  agInit(params: any) {
    this.params = params;
    this.data = params.value;
  }

  ngOnInit(): void {
    this.reqDisableForm = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      middleName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      nickName: new FormControl('',),
      batismalName: new FormControl(''),
      dob: new FormControl('', [Validators.required]),
      mobileNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      homePhoneNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      emailAddress: new FormControl('', [Validators.required, Validators.email]),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      addressLine3: new FormControl(''),
      city: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      parish: new FormControl('', Validators.required),
      maritalStatus: new FormControl('', Validators.required),
      dateofMarriage: new FormControl(''),
      aboutYourself: new FormControl(''),
      isFamilyHead: new FormControl(''),
    })

    this.approveReqForm = this.formBuilder.group({
      comment: new FormControl('', Validators.required)
    })

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.getUnapprovedUserData('approval_requests');

    // this.apiService.getCountryStates().subscribe((res: any) => {
    //   console.log(res.data.countryState)
    //   this.countries = res.data.countryState;
    //   console.log("Countries", this.countries);
    // })

  }


  onFilteringRadioButtonChange(event: any) {
    console.log(event)
    this.getUnapprovedUserData(event.value);

  }
  getUnapprovedUserData(usertype: string) {
    this.apiService.callGetService('getuserRecords?type=' + usertype).subscribe((res) => {


      if (usertype == 'approval_requests') {
        this.columnDefs = [
          { headerName: 'First Name', field: 'firstName', sortable: true, filter: true, width: 170, checkboxSelection: true },
          { headerName: 'Last Name', field: 'lastName', sortable: true, filter: true, width: 170 },
          { headerName: 'Member Type', field: 'memberType', sortable: true, filter: true, width: 150 },
          { headerName: 'Parish', field: 'parish_name', sortable: true, filter: true, width: 450 },
          // { headerName: 'City', field: 'city', sortable: true, filter: true, width: 150 },
          //{ headerName: 'State', field: 'state', sortable: true, filter: true, width: 150 },
          //{ headerName: 'Postal Code', field: 'postalCode', sortable: true, filter: true, width: 150 },
          { headerName: 'Actions', field: 'action', cellRendererFramework: ReqRendererComponent, width: 170 }
        ]
      } else if (usertype == 'rejected') {
        this.columnDefs = [
          { headerName: 'First Name', field: 'firstName', sortable: true, filter: true, width: 170, checkboxSelection: true },
          { headerName: 'Last Name', field: 'lastName', sortable: true, filter: true, width: 170 },
          { headerName: 'Member Type', field: 'memberTypeForRejected', sortable: true, filter: true, width: 150 },
          { headerName: 'Parish', field: 'parish_name', sortable: true, filter: true, width: 450 },
          // { headerName: 'City', field: 'city', sortable: true, filter: true, width: 150 },
          //{ headerName: 'State', field: 'state', sortable: true, filter: true, width: 150 },
          //{ headerName: 'Postal Code', field: 'postalCode', sortable: true, filter: true, width: 150 },
          { headerName: 'Reason', field: 'reason', sortable: true, filter: true, width: 180 }
        ]
      }

      //console.log(res.data.metaData);
      this.rowData = res.data.metaData;
    });
  }

  onRowClicked(event: any) {
    $("#imagemodal").modal("show");
    // this.router.navigate(['/dashboard/myprofile']);
    let rowData = event;
    this.selectedUserData = event.data;
    console.log(this.selectedUserData);
    let i = rowData.rowIndex;

    this.reqDisableForm.disable();

    this.reqDisableForm.patchValue({
      title: this.selectedUserData.title,
      firstName: this.selectedUserData.firstName,
      middleName: this.selectedUserData.middleNmae,
      lastName: this.selectedUserData.lastName,
      nickName: this.selectedUserData.nickName,
      batismalName: this.selectedUserData.batismalName,
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
      isFamilyHead: this.selectedUserData.isFamilyHead
    })
  }

  onUserReject() {
    //     $("#comment").show;
    //     if (!$('#comment').val()) {
    //       $('<span class="error" style="color:red;">Please Enter Comment</span>').
    //             insertBefore('#comment');
    // }    
    this.isApproved = false;
    this.approveReqForm.value.userId = this.selectedUserData.userId;
    this.approveReqForm.value.isApproved = this.isApproved;
    this.approveReqForm.value.loggedInuserId = this.loggedInUser;
    //console.log(this.approveReqForm.value);
    this.apiService.approveOrRejReq({ data: this.approveReqForm.value }).subscribe(res => {
      console.log(res);
      this.getUnapprovedUserData('approval_requests');
      $("#imagemodal").modal("hide");
    })
  }

  onUserApprove() {
    this.approveReqForm.value.userId = this.selectedUserData.userId;
    this.approveReqForm.value.isApproved = this.isApproved;
    this.approveReqForm.value.loggedInuserId = this.loggedInUser;
    console.log(this.approveReqForm.value);
    this.apiService.approveOrRejReq({ data: this.approveReqForm.value }).subscribe(res => {
      console.log(res);
      this.getUnapprovedUserData('approval_requests');
      $("#imagemodal").modal("hide");
    })
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

  resetForm() {
    this.approveReqForm.reset();
  }

  onSearchChange(event: any) {
    this.gridApi.setQuickFilter(this.term);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  // refreshGrid(){

  //   this.getUnapprovedUserData('approval_requests');
  // }
}

