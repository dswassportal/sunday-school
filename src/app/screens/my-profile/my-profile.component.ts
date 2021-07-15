import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { uiCommonUtils } from 'src/app/common/uiCommonUtils';
import { ComponentCanDeactivate } from 'src/app/component-can-deactivate';
import { ApiService } from 'src/app/services/api.service';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../services/auth.service'
const moment = _rollupMoment || _moment;


class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = 'MMMM DD YYYY';
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
  dropdownSettingsSundaySchoolName: any;
  dropdownSettingsSundaySchoolGrade: any;
  dropdownSettingsSchoolGrade: any;
  /*MarrirdOptions: any[] = [
    { value: "unmarried", viewValue: "unmarried" },
    { value: "married", viewValue: "married" }
  ];*/


  dropdownSettingsForSundaySchoolName: IDropdownSettings = {
    singleSelection: true,
    idField: 'orgId',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForSundaySchoolGrade: IDropdownSettings = {
    singleSelection: true,
    idField: 'orgId',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingsForSchoolGrade: IDropdownSettings = {
    singleSelection: true,
    idField: 'orgId',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };
  termId2: any;
  termId3: any;
  SSchoolsApitermEndtDate: any;
  SSchoolsApitermStartDate: any;

  constructor(private apiService: ApiService,
    private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils, private authService: AuthService,
    public router: Router) { }

  canDeactivate(): boolean {
    return !this.isDirty;
  }

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


  //, Validators.required
  //[Validators.required, Validators.email]
  ngOnInit(): void {
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
      memberDetails: this.formBuilder.array([this.addfamilyMembers()]),
      maritalStatus: new FormControl(''),
      dateofMarriage: new FormControl(''),
      aboutYourself: new FormControl(''),
      userId: new FormControl(''),
      isFamilyHead: new FormControl(''),
      orgId: new FormControl(''),
      isStudent: new FormControl(''),
      isFamilyMember: new FormControl('')
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
      sunSchoolGrade: new FormControl('', Validators.required),
      sunSchoolAcaYrStrtDate: new FormControl('', Validators.required),
      sunSchoolAcaYrEndDate: new FormControl('', Validators.required),
      termDetailId: new FormControl(''),
    });
    this.dropdownSettingsSundaySchoolName = this.dropdownSettingsForSundaySchoolName;
    this.dropdownSettingsSundaySchoolGrade = this.dropdownSettingsForSundaySchoolGrade;
    this.dropdownSettingsSchoolGrade = this.dropdownSettingsForSchoolGrade;

    this.myprofileform.valueChanges.subscribe((res: any) => {
      if (res.isStudent == 'yes') {
        this.ishidden = true;
      } else {
        this.ishidden = false;
      }
    });




    if (this.isApprovedUserLoggedIn == true) {

      this.userId = this.alluserdata.userId;
      this.fbUid = this.alluserdata.fbUid;
      this.isFamilyMember = this.alluserdata.isFamilyMember;
      this.isStudent = this.alluserdata.isStudent;
      console.log(this.isStudent, "isStudent")
      this.isFamilyHead = this.alluserdata.isFamilyHead;
      if (this.isFamilyHead == true) {
        this.isReadOnly = false;
      }
      else {
        this.isReadOnly = true;
      }

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


      this.apiService.callGetService('getParishData').subscribe((res: any) => {
        this.parishDataList = res.data.metaData.Parish;
      })



      this.apiService.callGetService(`getSSchools`).subscribe((res: any) => {

        this.schoolDataList = res.data.schoolData;
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

      });



      // this.apiService.callGetService('getCountryStates').subscribe((res: any) => {
      //   this.countries = res.data.countryState;
      // })

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



      this.myprofileform.patchValue({
        country: this.alluserdata.country,

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
        //country: this.alluserdata.country,
        state: this.alluserdata.state,
        parish: this.alluserdata.orgId,
        //memberDetails: this.alluserdata.memberDetails,
        maritalStatus: this.alluserdata.maritalStatus,
        dateofMarriage: this.alluserdata.dateOfMarriage,
        aboutYourself: this.alluserdata.aboutYourself,
        userId: this.alluserdata.userId,
      });

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
        //sunSchoolAcaYrStrtDate: this.alluserdata.sundaySchoolDetails[0].schoolYearStartDate,
        //sunSchoolAcaYrEndDate: this.alluserdata.sundaySchoolDetails[0].schoolYearEndDate,


      });


      if (this.studentDetailsForm.sunSchoolId != null) {
        this.studentDetailsForm.patchValue({
          sunSchoolId: this.alluserdata.sundaySchoolDetails[0].sunSchoolId // array
        });
      }

      if (this.studentDetailsForm.sunSchoolGrade != null) {
        this.studentDetailsForm.patchValue({
          sunSchoolGrade: this.alluserdata.sunSchoolGrade // array
        });
      }

      if (this.studentDetailsForm.schoolGrade != null) {
        this.studentDetailsForm.patchValue({
          schoolGrade: this.alluserdata.schoolGrade // array
        });
      }

    }



    if (this.isApprovedUserLoggedIn == false) {

      this.signUpForm = this.formBuilder.group({
        title: new FormControl('', Validators.required),
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        dob: new FormControl(''),
        password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[@!#$%&*])(?=.*?[0-9]).{8,}$')]),
        cnfmpwd: new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[@]!@#$%&*)(?=.*?[0-9]).{8,}$')]),
        mobileNo: new FormControl('', [Validators.required]),
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

      this.apiService.callGetService('getLookupMasterData?types=title,membership').subscribe((res: any) => {
        this.titles = res.data.titles;
        this.memberships = res.data.memberships;
      })

    }
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

  // @ViewChild(MatDatepicker) picker:any;

  // monthSelected(event : any) {
  //   this.studentDetailsForm.studntAcaYrStrtDate.setValue(event);
  //   this.picker.close();
  // }






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
        emailId: e.emailId,
        userId: e.userId
      }));
    });
    return formArray;
  }

  //to change value of sundayschool grade dropdrown based on based
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

  gradeChange() {
    this.studentDetailsForm.patchValue({
      sunSchoolGrade: this.studentDetailsForm.value.schoolGrade
    });
  }

  onaddbtnclick() {
    this.members = this.myprofileform.get('memberDetails') as FormArray;
    this.members.push(this.addfamilyMembers());
  }

  addfamilyMembers(): FormGroup {
    return this.formBuilder.group({
      title: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      middleName: new FormControl(''),
      lastName: new FormControl('', Validators.required),
      relationship: new FormControl('', Validators.required),
      baptismalName: new FormControl(''),
      dob: new FormControl('',),
      mobileNo: new FormControl('', [Validators.required]),
      emailId: new FormControl('', [Validators.required, Validators.email]),
      userId: new FormControl(''),
    });
  }
  //event handler for the select element's change event
  selectChangeHandler(event: any) {
    //update the ui
    this.selectedGrade = event.target.value;
  }
  onremovebtnclick(index: any) {
    (<FormArray>this.myprofileform.get('memberDetails').removeAt(index));
  }

  updateUserProfile() {
    if ((this.myprofileform.invalid && this.isApprovedUserLoggedIn == true)) {
      this.uiCommonUtils.showSnackBar("Please fill out all required fields!", "error", 3000);
      //   return
    }
    else //{
      if (this.isApprovedUserLoggedIn == true) {
        this.myprofileform.value.userId = this.userId;
        this.myprofileform.value.updatedBy = this.userId;
        this.myprofileform.value.orgId = this.orgId;
        this.myprofileform.value.termDetailId = this.SSchoolsApitermId;
        this.myprofileform.value.sunSchoolId = this.termId2;
        this.alluserdata.isStudent = this.myprofileform.value.isStudent;


        let currFHValue = this.myprofileform.value.isFamilyHead;
        if (currFHValue === true || currFHValue == 'true')
          this.myprofileform.value.isFamilyHead = true;
        else if (currFHValue === false || currFHValue == 'false')
          this.myprofileform.value.isFamilyHead = false;
        else if (currFHValue === '')
          this.myprofileform.value.isFamilyHead = this.alluserdata.isFamilyHead


        // let currisStudentValue = this.myprofileform.value.isStudent;
        // if (currisStudentValue === false || currisStudentValue == 'yes')
        //   this.myprofileform.value.isStudent = true;
        // else if (currisStudentValue === false || currisStudentValue == 'no')
        //   this.myprofileform.value.isStudent = false;
        // else if (currisStudentValue === '')
        //   this.myprofileform.value.isStudent = this.alluserdata.isStudent



        // this.myprofileform.valueChanges.subscribe((res: any) => {
        //   if (res.isStudent == 'yes') {
        //     this.myprofileform.value.isStudent = true;
        //   } else if (res.isStudent == 'no') {
        //     this.myprofileform.value.isStudent = false; 
        //   }else if (res.isStudent === '')
        //     this.myprofileform.value.isStudent = this.alluserdata.isStudent
        // });
        //this.isStudent = this.myprofileform.value.isStudent
        console.log(this.isStudent, "student value");
        console.log(this.myprofileform.value.isStudent, "studentvalue2")

        if (this.alluserdata.emailId.toLowerCase() !== this.myprofileform.value.emailId.toLowerCase()) {
          let confmMsgSt = 'You have changed your email address, You need to complete email verfication process for new email otherwise your account will be locked. Press OK to continue';
          if (confirm(confmMsgSt)) {
            this.authService.updateEmailAddress(this.myprofileform.value.emailId)?.then(() => {
              this.invokeApi({
                ...this.myprofileform.value,
                ...this.studentDetailsForm.value,
                respondWith: 'user_meta_data',
                hasEmailChanged: true,
                oldEmail: this.alluserdata.emailId
              })
            }).catch((error: any) => {
              console.log(error);
              this.uiCommonUtils.showSnackBar("Session Expired!", "error", 3000);
            })
          }
        } else {
          let payloadJson = {
            ...this.myprofileform.value,
            ...this.studentDetailsForm.value,
            termDetailId: this.SSchoolsApitermId,
            //sunSchoolId : this.termId2,

            sunSchoolAcaYrStrtDate: this.SSchoolsApitermStartDate,
            sunSchoolAcaYrEndDate: this.SSchoolsApitermEndtDate,

            respondWith: 'user_meta_data',
            hasEmailChanged: false
          };
          if (this.myprofileform.value.orgId !== this.myprofileform.value.parish) {
            payloadJson.hasParishChanged = true;
          }
          this.invokeApi(payloadJson);
        }
      }

    if (this.isApprovedUserLoggedIn == false) {

      this.signUpForm.value.userId = this.alluserdata.userId;
      this.signUpForm.value.updatedBy = this.alluserdata.userId;
      // this.signUpForm.value.orgId = this.alluserdata.orgId;

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
    this.router.navigate(['/dashboard/']);
  }
  unpproveCancel() {
    this.router.navigate(['/dashboard/']);
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
  //miscellaneous
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
}