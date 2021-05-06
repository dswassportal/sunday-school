import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { uiCommonUtils } from 'src/app/common/uiCommonUtils';
import { ComponentCanDeactivate } from 'src/app/component-can-deactivate';
import { ApiService } from 'src/app/services/api.service';

import { Moment } from 'moment';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';

const moment = _rollupMoment || _moment;


class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = 'MMMM YYYY';
    return moment(date).format(formatString);
  }
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: CustomDateAdapter
    }
  ]
})
export class MyProfileComponent implements OnInit, ComponentCanDeactivate {
  selectedUserRole: any;
  rolesArr: never[] | undefined;
  orgs: any;
  /*MarrirdOptions: any[] = [
    { value: "unmarried", viewValue: "unmarried" },
    { value: "married", viewValue: "married" }
  ];*/
  constructor(private apiService: ApiService,
    private http: HttpClient, private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils,
    public router: Router) { }

  canDeactivate(): boolean {
    return !this.isDirty;
  }

  myprofileform: any;
  studentDetailsForm:any;
  members: any;
  isDirty: boolean = false;
  hasAddMemPerm: boolean = false;
  userRecords: any;
  fbUid: any;
  alluserdata: any;
  userId: any;
  isFamilyHead: any;
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
  contactNo: any;
  max_date!: any;
  maxDate = new Date();

  ngOnInit(): void {
    this.myprofileform = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      middleName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      nickName: new FormControl('', Validators.required),
      baptismalName: new FormControl('', Validators.required),
      dob: new FormControl('', [Validators.required]),
      homePhoneNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      mobileNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      emailId: new FormControl('', [Validators.required, Validators.email]),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl('', Validators.required),
      addressLine3: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      parish: new FormControl(''),
      memberDetails: this.formBuilder.array([this.addfamilyMembers()]),
      maritalStatus: new FormControl('', Validators.required),
      dateofMarriage: new FormControl('',[ Validators.required]),
      aboutYourself: new FormControl('', Validators.required),
      userId: new FormControl(''),
      isFamilyHead: new FormControl(''),
      orgId: new FormControl(''),
      isStudent:new FormControl('')
    });



    this.alluserdata = this.uiCommonUtils.getUserMetaDataJson();
    this.isApprovedUserLoggedIn = this.alluserdata.isApproved;

    this.studentDetailsForm = this.formBuilder.group({
      studentAcaDtlId: new FormControl('', Validators.required),
      studentId: new FormControl('', Validators.required),
      schoolName: new FormControl('', Validators.required),
      schoolGrade: new FormControl('', Validators.required),
      studntAcaYrStrtDate: new FormControl('', Validators.required),
      studntAcaYrEndDate: new FormControl('', Validators.required),
      schoolAddrLine1: new FormControl('', Validators.required),
      schoolAddrLine2: new FormControl('', Validators.required),
      schoolAddrLine3: new FormControl('', Validators.required),
      schoolCountry: new FormControl('', Validators.required),
      schoolState: new FormControl('', Validators.required),
      schoolCity: new FormControl('', Validators.required),
      schoolPostalCode: new FormControl('', Validators.required),
      sunSchoolStudentAcaDtlId: new FormControl('', Validators.required),
      sunSchoolStudentId: new FormControl('', Validators.required),
      sunSchoolId: new FormControl('', Validators.required),
      sunSchoolGrade:  new FormControl('', Validators.required),
      sunSchoolAcaYrStrtDate: new FormControl('', Validators.required),
      sunSchoolAcaYrEndDate: new FormControl('', Validators.required)
    });


    console.log("this.alluserdata.studentAcademicdetails[0].schoolAddressline1", this.alluserdata.studentAcademicdetails[0].schoolAddressline1);

    this.studentDetailsForm.patchValue({
      studentAcaDtlId: this.alluserdata.studentAcademicdetails[0].studentAcademicDetailId,
      studentId: this.alluserdata.studentAcademicdetails[0].studentId,

      schoolName: this.alluserdata.studentAcademicdetails[0].schoolName,
      schoolGrade: this.alluserdata.studentAcademicdetails[0].schoolGrade,
      studntAcaYrStrtDate: this.alluserdata.studentAcademicdetails[0].academicYearStartDate,
      studntAcaYrEndDate: this.alluserdata.studentAcademicdetails[0].academicYearEndDate,
      schoolAddrLine1: this.alluserdata.studentAcademicdetails[0].schoolAddressline1,
      schoolAddrLine2: this.alluserdata.studentAcademicdetails[0].schoolAddressline2,
      schoolAddrLine3: this.alluserdata.studentAcademicdetails[0].schoolAddressline3,
      schoolCountry: this.alluserdata.studentAcademicdetails[0].schoolCity,
      schoolState: this.alluserdata.studentAcademicdetails[0].schoolState,
      schoolCity: this.alluserdata.studentAcademicdetails[0].schoolPostalCode,
      schoolPostalCode: this.alluserdata.studentAcademicdetails[0].schoolCountry,
      //sunday school
      sunSchoolStudentAcaDtlId: this.alluserdata.sundaySchoolDetails[0].studentSundaySchooldtlId,
      sunSchoolStudentId: this.alluserdata.sundaySchoolDetails[0].studentId,
      sunSchoolId: this.alluserdata.sundaySchoolDetails[0].schoolId,
      sunSchoolGrade: this.alluserdata.sundaySchoolDetails[0].schoolGrade,
      sunSchoolAcaYrStrtDate: this.alluserdata.sundaySchoolDetails[0].schoolYearStartDate,
      sunSchoolAcaYrEndDate: this.alluserdata.sundaySchoolDetails[0].schoolYearEndDate,
    });





    if (this.isApprovedUserLoggedIn == true) {

      this.userId = this.alluserdata.userId;
      this.fbUid = this.alluserdata.fbUid;
      this.isFamilyHead = this.alluserdata.isFamilyHead;
      this.orgId = this.alluserdata.orgId;
      this.memberDetailsData = this.alluserdata.memberDetails;
      this.myprofileform.setControl('memberDetails', this.setMemberDetails(this.memberDetailsData));



      this.hasAddMemPerm = this.uiCommonUtils.hasPermissions("add_member");
      this.showFamilyHeadQuestion = !this.alluserdata.isFamilyMember;



      //  this.apiService.getUsersData({ data: this.userRecords }).subscribe((res) => {
      //   // console.log('These are users from database : ');
      //   // console.log(res.data.metaData);
      //    this.alluserdata = res.data.metaData;
      //  });

      this.apiService.getParishListData().subscribe(res => {
        for (let i = 0; i < res.data.metaData.Parish.length; i++) {
          this.parishList = res.data.metaData.Parish;
        }
        //console.log(this.parishList);
      });

      this.apiService.getCountryStates().subscribe((res: any) => {
        this.countries = res.data.countryState;
        // console.log("Countries", this.countries);
        this.patchCountryState(this.alluserdata.country);
      })

      this.myprofileform.patchValue({
        //country: this.alluserdata.country,
       
        title: this.alluserdata.title,
        firstName: this.alluserdata.firstName,
        middleName: this.alluserdata.middleName,
        lastName: this.alluserdata.lastName,
        nickName: this.alluserdata.nickName,
        baptismalName: this.alluserdata.baptismalName,
        dob: this.alluserdata.dob,
        homePhoneNo: this.alluserdata.homePhoneNo,
        mobileNo: this.alluserdata.mobile_no,
        emailId: this.alluserdata.emailId,
        addressLine1: this.alluserdata.addressLine1,
        addressLine2: this.alluserdata.addressLine2,
        addressLine3: this.alluserdata.addressLine3,
        city: this.alluserdata.city,
        postalCode: this.alluserdata.postalCode,
        country: this.alluserdata.country,
        state: this.alluserdata.state,
        parish: this.alluserdata.orgName,
        //memberDetails: this.alluserdata.memberDetails,
        maritalStatus: this.alluserdata.maritalStatus,
        dateofMarriage: this.alluserdata.dateOfMarriage,
        aboutYourself: this.alluserdata.aboutYourself,
        userId: this.alluserdata.userId,
      });
      this.patchCountryState(this.alluserdata.country);
    } if (this.isApprovedUserLoggedIn == false) {

      this.signUpForm = this.formBuilder.group({
        title: new FormControl('', Validators.required),
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        dob: new FormControl('', Validators.required),
        password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[@])(?=.*?[0-9]).{8,}$')]),
        cnfmpwd: new FormControl('', Validators.required),
        mobileNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
        memberType: new FormControl('', Validators.required),
        orgId: new FormControl('', Validators.required),
        abtyrslf: new FormControl('')
      });

      this.signUpForm.patchValue({
        title: this.alluserdata.title,
        firstName: this.alluserdata.firstName,
        lastName: this.alluserdata.lastName,
        dob: this.alluserdata.dob,
        mobileNo: this.alluserdata.mobile_no,
        email: this.alluserdata.emailId,
        parish: this.alluserdata.orgName,
        userId: this.alluserdata.userId,
        orgId: this.alluserdata.orgId,
        memberType: this.alluserdata.membershipType,
        abtyrslf: this.alluserdata.aboutYourself,
      });

      this.apiService.getParishListData().subscribe(res => {

        for (let i = 0; i < res.data.metaData.Parish.length; i++) {
          this.parishList = res.data.metaData.Parish;
        }
      })

    }
  }

  isStudentFn(event:any){
    if(event.value == "true"){
      this.isStudentvar = true;
    }
    if(event.value == "false"){
      this.isStudentvar = false;
    }
    //this.isStudentvar = !this.isStudentvar;
  }

  @ViewChild(MatDatepicker) picker:any;

  monthSelected(event : any) {
    this.studentDetailsForm.studntAcaYrStrtDate.setValue(event);
    this.picker.close();
  }

  setMemberDetails(memberDetailsData: any): FormArray {
    const formArray = new FormArray([]);
    memberDetailsData.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        title: e.title,
        firstName: e.firstName,
        middleName: e.middleName,
        lastName: e.lastName,
        relationship: e.relationship,
        baptismalName: e.baptismalName,
        dob: e.dob,
        mobileNo: e.mobileNo,
        emailId: e.emailId
      }));
    });
    return formArray;
  }

  onaddbtnclick() {
    this.members = this.myprofileform.get('memberDetails') as FormArray;
    this.members.push(this.addfamilyMembers());
  }

  addfamilyMembers(): FormGroup {
    return this.formBuilder.group({
      title: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      middleName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      relationship: new FormControl('', Validators.required),
      baptismalName: new FormControl('', Validators.required),
      dob: new FormControl('', Validators.required),
      mobileNo: new FormControl('', [Validators.pattern('[0-9].{9}')]),
      emailId: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  onremovebtnclick(index: any) {
    (<FormArray>this.myprofileform.get('memberDetails').removeAt(index));
  }

  updateUserProfile() {
    // if (this.myprofileform.invalid) {
    //   return
    // }
    // else {
    //    console.log("this.userId", this.userId);
    if (this.isApprovedUserLoggedIn == true) {
      this.myprofileform.value.userId = this.userId;
      this.myprofileform.value.updatedBy = this.userId;
      this.myprofileform.value.orgId = this.orgId;

      // if((this.myprofileform.value.isFamilyHead == '' || this.alluserdata.isFamilyHead ==true )
      //      &&  this.myprofileform.value.isFamilyHead == true){
      //   this.myprofileform.value.isFamilyHead = true;
      // }else
      // this.myprofileform.value.isFamilyHead = false;

      let currFHValue = this.myprofileform.value.isFamilyHead;
      if (currFHValue === true || currFHValue == 'true')
        this.myprofileform.value.isFamilyHead = true;
      else if (currFHValue === false || currFHValue == 'false')
        this.myprofileform.value.isFamilyHead = false;
      else if (currFHValue === '')
        this.myprofileform.value.isFamilyHead = this.alluserdata.isFamilyHead

      this.apiService.updateUserProfile({data:{ ...this.myprofileform.value, ...this.studentDetailsForm.value }}).subscribe((res: any) => {
        if (res.data.status == "success") {
          this.uiCommonUtils.showSnackBar("Profile updated successfully!", "success", 3000);
          this.getAndSetMetdata(this.userId)
        }
        else
          this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      });

    } if (this.isApprovedUserLoggedIn == false) {

      this.signUpForm.value.userId = this.alluserdata.userId;
      this.signUpForm.value.updatedBy = this.alluserdata.userId;
      this.signUpForm.value.orgId = this.alluserdata.orgId;

      this.apiService.callPostService(`updateBasicProfile`, this.signUpForm.value).subscribe((data) => {

        if (data.data.status == "success") {
          this.uiCommonUtils.showSnackBar("Profile updated successfully!", "success", 3000);
          this.getAndSetMetdata(this.alluserdata.userId)
        }
        else
          this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
      });


    }
  }

  getAndSetMetdata(userId: number) {
    this.apiService.callGetService(`getUserMetaData?uid=${userId}`).subscribe((data) => {
      localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData));
    });
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
    this.router.navigate(['/dashboard']);
  }

  goToLogin() {
    this.router.navigate(['/signin']);
  }

  getNumber(event: any) {
    // console.log(event);
    this.contactNo = event;
  }

  validateDOB(event: any) {
    let year = new Date(event).getFullYear();
    let today = new Date().getFullYear();
    if (year > today) {
      alert("Select Date in Past");
    }
  }
}
