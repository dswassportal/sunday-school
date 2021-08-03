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
    public router: Router, private familyMemberDetails: FamilyMemberDetails) { }


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
  memberData: any;
  selectedGrade: string = '';
  selectedUserRole: any;
  rolesArr: never[] | undefined;
  orgs: any;
  name: any;
  acadmicGradeSelection = 'Grade1';
  sundaySchoolGradeSelect = 'Grade1';
  sundaySchoolNameSelect = '';
  temp: any;
  schoolData: any;
  schoolDataList!: any[];
  areDatesDisabled: boolean = false;
  schoolGrade: any;
  parishDataList!: any[];
  sundaySchoolTermsList!: any[];
  selectedTerm!: any[];
  GradeData!: any[];
  SSchoolsApitermId: any;
  termId2: any;
  termId3: any;
  SSchoolsApitermEndtDate: any;
  SSchoolsApitermStartDate: any;


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
      //isFamilyHead: new FormControl(''),
      orgId: new FormControl(''),
      isStudent: new FormControl(''),
      isFamilyMember: new FormControl('')
    });

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
      sunSchoolGrade: new FormControl('', Validators.required),
      sunSchoolAcaYrStrtDate: new FormControl('', Validators.required),
      sunSchoolAcaYrEndDate: new FormControl('', Validators.required),
      termDetailId: new FormControl(''),
    });

    this.myprofileform.valueChanges.subscribe((res: any) => {
      if (res.isStudent == 'yes') {
        this.ishidden = true;
      } else {
        this.ishidden = false;
      }
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

      this.apiService.callGetService(`getUserMetaData?uid=${this.selectedRowData.userId}`).subscribe((res) => {
        //localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData));
        //console.log("res.data.metaData", res.data.metaData);
        this.memberData = res.data.metaData;
        // if (memberData.memberDetails.length > 0) {
        //   this.myprofileform.setControl('memberDetails', this.setMemberDetails(memberData.memberDetails));
        // }
        if (this.memberData.isApproved == false) {
          this.uiCommonUtils.showSnackBar("This user in not approved yet!", "error", 3000);
        }

        console.log("this.memberData", this.memberData);


        this.myprofileform.patchValue({
          country: this.memberData.country,

          title: this.memberData.title,
          firstName: this.memberData.firstName,
          middleName: this.memberData.middleName,
          lastName: this.memberData.lastName,
          nickName: this.memberData.nickName,
          baptismalName: this.memberData.baptismalName,
          dob: this.memberData.dob,
          homePhoneNo: this.memberData.homePhoneNo,
          mobileNo: this.memberData.mobile_no,
          emailId: this.memberData.emailId,
          addressLine1: this.memberData.addressLine1,
          addressLine2: this.memberData.addressLine2,
          addressLine3: this.memberData.addressLine3,
          city: this.memberData.city,
          postalCode: this.memberData.postalCode,
          //country: memberData.country,
          state: this.memberData.state,
          parish: this.memberData.orgId,
          isStudent: this.memberData.isStudent,
          //memberDetails: memberData.memberDetails,
          maritalStatus: this.memberData.maritalStatus,
          dateofMarriage: this.memberData.dateOfMarriage,
          aboutYourself: this.memberData.aboutYourself,
          userId: this.memberData.userId,
        });
      });
    }

    this.apiService.callGetService('getParishData').subscribe((res: any) => {
      this.parishDataList = res.data.metaData.Parish;
    })



    this.apiService.callGetService(`getSSchools`).subscribe((res: any) => {
      if (res.data.schoolData.length > 0) {
        this.schoolDataList = res.data.schoolData;
      }
      else{
        this.schoolDataList = [          
            {
                "orgId": null,
                "name": "",
                "parishName": "",
                "parishId": null,
                "grades": [
                    {
                        "orgId": null,
                        "name": ""
                    }
                ]
            }        
      ];
      }

      this.selectedTerm = res.data.currentTerm;

      this.studentDetailsForm.patchValue({
        termDetailId: `${res.data.currentTerm.termYear} (${res.data.currentTerm.termStartDate} - ${res.data.currentTerm.termEndDate})`,
        sunSchoolAcaYrEndDate: res.data.currentTerm.termEndDate,
        sunSchoolAcaYrStrtDate: res.data.currentTerm.termStartDate,
      });

      // this.termId2=res.data.schoolData[0].orgId
      //   console.log(this.termId2,"orgId")

      // this.termId3=res.data.schoolData[0].grades.orgId
      // console.log(this.termId3,"gradename")
      this.SSchoolsApitermId = res.data.currentTerm.termDtlId;
      this.SSchoolsApitermStartDate = res.data.currentTerm.termStartDate
      this.SSchoolsApitermEndtDate = res.data.currentTerm.termEndDate

      this.userId = this.alluserdata.userId;
      this.fbUid = this.alluserdata.fbUid;
      this.isFamilyMember = this.alluserdata.isFamilyMember;
      this.isStudent = this.alluserdata.isStudent;

    });

    console.log("this.memberData", this.memberData);
    console.log("this.alluserdata",this.alluserdata);
    this.studentDetailsForm.patchValue({
      studentAcaDtlId: this.memberData.studentAcademicdetails[0].studentAcademicDetailId,
      studentId: this.memberData.studentAcademicdetails[0].studentId,

      schoolName: this.memberData.studentAcademicdetails[0].schoolName,
      schoolGrade: this.memberData.studentAcademicdetails[0].schoolGrade,
      studntAcaYrStrtDate: this.memberData.studentAcademicdetails[0].academicYearStartDate,
      studntAcaYrEndDate: this.memberData.studentAcademicdetails[0].academicYearEndDate,
      schoolAddrLine1: this.memberData.studentAcademicdetails[0].schoolAddressline1,
      schoolAddrLine2: this.memberData.studentAcademicdetails[0].schoolAddressline2,
      schoolAddrLine3: this.memberData.studentAcademicdetails[0].schoolAddressline3,
      schoolCountry: this.memberData.studentAcademicdetails[0].schoolCity,
      schoolState: this.memberData.studentAcademicdetails[0].schoolState,
      schoolCity: this.memberData.studentAcademicdetails[0].schoolPostalCode,
      schoolPostalCode: this.memberData.studentAcademicdetails[0].schoolCountry,
      //sunday school
      sunSchoolStudentAcaDtlId: this.memberData.sundaySchoolDetails[0].studentSundaySchooldtlId,
      sunSchoolStudentId: this.memberData.sundaySchoolDetails[0].studentId,
      sunSchoolId: this.memberData.sundaySchoolDetails[0].schoolId,
      sunSchoolGrade: this.memberData.sundaySchoolDetails[0].schoolGrade,
      //sunSchoolAcaYrStrtDate: this.alluserdata.sundaySchoolDetails[0].schoolYearStartDate,
      //sunSchoolAcaYrEndDate: this.alluserdata.sundaySchoolDetails[0].schoolYearEndDate,


    });


    if (this.studentDetailsForm.sunSchoolId != null) {
      this.studentDetailsForm.patchValue({
        sunSchoolId: this.memberData.sundaySchoolDetails[0].sunSchoolId // array
      });
    }

    if (this.studentDetailsForm.sunSchoolGrade != null) {
      this.studentDetailsForm.patchValue({
        sunSchoolGrade: this.memberData.sunSchoolGrade // array
      });
    }

    if (this.studentDetailsForm.schoolGrade != null) {
      this.studentDetailsForm.patchValue({
        schoolGrade: this.memberData.schoolGrade // array
      });
    }

  }


  gradeChange() {
    this.studentDetailsForm.patchValue({
      sunSchoolGrade: this.studentDetailsForm.value.schoolGrade
    });
  }
  // on acadmic grade dropdown
  onAcadmicGradeChange(event: any) {
    this.sundaySchoolGradeSelect = event;
  }

  radioClick() {

  }

  eventStartDateChange() {
    this.studentDetailsForm.patchValue({
      sunSchoolAcaYrEndDate: this.studentDetailsForm.value.sunSchoolAcaYrStrtDate
    });
    this.areDatesDisabled = false;
  }

  cancel() {
    this.router.navigate(['/dashboard/familyMemberDetails']);
  }

  isStudentFn(event: any) {
    if (event.value == "true") {
      this.isStudentvar = true;
      this.isStudent = true;
      this.myprofileform.value.isStudent = true;
    }
    if (event.value == "false") {
      this.isStudentvar = false;
      this.isStudent = false;
      this.myprofileform.value.isStudent = false;
    }
    //this.isStudentvar = !this.isStudentvar;
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


    this.myprofileform.value.userId = this.memberData.userId;
    this.myprofileform.value.updatedBy = this.memberData.userId;
    this.myprofileform.value.orgId = this.memberData.orgId;


    let payloadJson = {
      ...this.myprofileform.value,
      ...this.studentDetailsForm.value,
      termDetailId: this.SSchoolsApitermId,

      sunSchoolAcaYrStrtDate: this.SSchoolsApitermStartDate,
      sunSchoolAcaYrEndDate: this.SSchoolsApitermEndtDate,

      respondWith: 'user_meta_data',
      hasEmailChanged: false,
      userId: this.memberData.userId
    };
    if (this.myprofileform.value.orgId !== this.myprofileform.value.parish) {
      payloadJson.hasParishChanged = false;
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

  //SunSchool End Date Validator that is SunSchoolEndDate>SunSchoolStartDate
  comparisonSunSchoolEndDateValidator(): any {
    let sunSchoolStartDate = this.studentDetailsForm.value['sunSchoolAcaYrStrtDate'];
    let sunSchoolEndDate = this.studentDetailsForm.value['sunSchoolAcaYrEndDate'];

    let startnew = new Date(sunSchoolStartDate);
    let endnew = new Date(sunSchoolEndDate);

    if (startnew > endnew) {
      return this.studentDetailsForm.controls['sunSchoolAcaYrEndDate'].setErrors({ 'invaliddaterange': true });
    }

  }

  //SunSchool Start Date Validator that is SunSchoolStartDate < SunSchoolEndDate
  comparisonSunSchoolStartDateValidator(): any {
    let sunSchoolStartDate = this.studentDetailsForm.value['sunSchoolAcaYrStrtDate'];
    let sunSchoolEndDate = this.studentDetailsForm.value['sunSchoolAcaYrEndDate'];

    let startnew = new Date(sunSchoolStartDate);
    let endnew = new Date(sunSchoolEndDate);
    if (startnew > endnew) {
      return this.studentDetailsForm.controls['sunSchoolAcaYrStrtDate'].setErrors({ 'invaliddaterange': true });
    }


  }



}
