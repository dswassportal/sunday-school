import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { uiCommonUtils } from 'src/app/common/uiCommonUtils';
import { ApiService } from 'src/app/services/api.service';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../services/auth.service'
import { FamilyMemberDetails } from '../family-member-details/family-member-details.dataService';
const moment = _rollupMoment || _moment;

class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = 'MMMM DD YYYY';
    return moment(date).format(formatString);
  }
}

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit {

  constructor(private apiService: ApiService,
    private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils, private authService: AuthService,
    public router: Router, private familyMemberDetails : FamilyMemberDetails) { }

   
  myprofileform: any;
  studentDetailsForm: any;
  members: any;
  isDirty: boolean = false;
  hasAddMemPerm: boolean = false;
  userRecords: any;
  fbUid: any;
  alluserdata: any;
  userId: any;
  isFamilyHead: any;
  isReadOnly: any;
  isStudentvar!: boolean;
  orgId: any;
  parishList!: any[];
  memberDetailsData!: any[];
  countries!: any[];
  states!: any[];
  signUpForm: any;
  selectedCountry: any;
  showFamilyHeadQuestion: boolean = false;
  isApprovedUserLoggedIn: boolean = false;
  showStudentQuestion: boolean = false;
  contactNo: any;
  max_date!: any;
  maxDate = new Date();
  minDate = new Date();
  ishidden: boolean = false;
  isStudent: any;
  grades!: any[];
  relationships!: any[];
  maritalstatus!: any[];
  membership!: any[];
  titles!: any[];
  memberships!: any[];
  error = { validatePhoneNumber: true };
  isFamilyMember: any;
  isFamilyHeadRadiobtn: boolean = false;
  selectedRowData: any;
  selectedUrl: any;
  isStateDataSet: any;


  ngOnInit(): void {

    this.alluserdata = this.uiCommonUtils.getUserMetaDataJson();
    this.isApprovedUserLoggedIn = this.alluserdata.isApproved;

    this.myprofileform = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      middleName: new FormControl(''),
      lastName: new FormControl('', Validators.required),
      nickName: new FormControl(''),
      baptismalName: new FormControl(''),
      dob: new FormControl(''),
      homePhoneNo: new FormControl(''),
      //mobileNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      mobileNo: new FormControl('', [Validators.required]),
      emailId: new FormControl('', [Validators.email]),
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
      userId: new FormControl(''),
      isFamilyHead: new FormControl(''),
      orgId: new FormControl(''),
      isStudent: new FormControl(''),
      isFamilyMember: new FormControl('')
    });

    
    this.apiService.getParishListData().subscribe(res => {
      for (let i = 0; i < res.data.metaData.Parish.length; i++) {
        this.parishList = res.data.metaData.Parish;
      }

      //console.log(this.parishList);
    });

    this.apiService.callGetService('getLookupMasterData?types=title,grade,relationship,martial status').subscribe((res: any) => {
      this.titles = res.data["titles"];
      this.grades = res.data["grades"];
      this.relationships = res.data["relationships"];
      this.maritalstatus = res.data["martial statuss"];

    })

    this.apiService.getCountryStates().subscribe((res: any) => {
      this.countries = res.data.countryState;
      // console.log("Countries", this.countries);
      this.patchCountryState(this.alluserdata.country);
    })


    if (this.familyMemberDetails.getSelectedRowData() != undefined) {
      this.selectedRowData = this.familyMemberDetails.getSelectedRowData();
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowData));

      this.apiService.callGetService(`getUserMetaData?uid=${this.selectedRowData.userId}`).subscribe((res) => {
        //localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData));
        //console.log("res.data.metaData", res.data.metaData);
        let memberData = res.data.metaData;
        // if (memberData.memberDetails.length > 0) {
        //   this.myprofileform.setControl('memberDetails', this.setMemberDetails(memberData.memberDetails));
        // }


        this.myprofileform.patchValue({
          country: memberData.country,

          title: memberData.title,
          firstName: memberData.firstName,
          middleName: memberData.middleName,
          lastName: memberData.lastName,
          nickName: memberData.nickName,
          baptismalName: memberData.baptismalName,
          dob: memberData.dob,
          homePhoneNo: memberData.homePhoneNo,
          mobileNo: memberData.mobile_no,
          emailId: memberData.emailId,
          addressLine1: memberData.addressLine1,
          addressLine2: memberData.addressLine2,
          addressLine3: memberData.addressLine3,
          city: memberData.city,
          postalCode: memberData.postalCode,
          //country: memberData.country,
          state: memberData.state,
          parish: memberData.orgId,
          //memberDetails: memberData.memberDetails,
          maritalStatus: memberData.maritalStatus,
          dateofMarriage: memberData.dateOfMarriage,
          aboutYourself: memberData.aboutYourself,
          userId: memberData.userId,
        });
      });
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/familyMemberDetails']);
  }

  changeCountry(country: any) {
    for (let i = 0; i < this.countries.length; i++) {
      if (this.countries[i].countryName == country.target.value) {
        console.log(this.countries[i].states);
        this.states = this.countries[i].states;
      }
    }
  }

  patchCountryState(country: any) {
    for (let i = 0; i < this.countries.length; i++) {
      if (this.countries[i].countryName == country) {
        console.log(this.countries[i].states);
        this.states = this.countries[i].states;
      }
    }
  }

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

  updateUserProfile() {
  
    
        this.myprofileform.value.userId = this.userId;
        this.myprofileform.value.updatedBy = this.userId;
        this.myprofileform.value.orgId = this.orgId;


       
          let payloadJson = {
            ...this.myprofileform.value,
            respondWith: 'user_meta_data',
            hasEmailChanged: false,
          };
          if (this.myprofileform.value.orgId !== this.myprofileform.value.parish) {
            payloadJson.hasParishChanged = true;
          }
          this.invokeApi(payloadJson);
       
    

    

  }

  invokeApi(payload: any) {
    this.apiService.callPostService(`updateUserRoles`,
      payload
    ).subscribe((res: any) => {
      if (res.data.status == "success") {
        localStorage.setItem('chUserMetaData', JSON.stringify(res.data.metaData));
        this.uiCommonUtils.showSnackBar("Profile updated successfully!", "success", 3000);
      }
      else
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
    });
  }

}
