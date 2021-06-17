import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { uiCommonUtils } from 'src/app/common/uiCommonUtils';
import { ApiService } from '../../services/api.service';
declare let $: any;
@Component({
  selector: 'app-staff-assignment',
  templateUrl: './staff-assignment.component.html',
  styleUrls: ['./staff-assignment.component.css']
})
export class StaffAssignmentComponent implements OnInit {

  staffDataFormGroup: any;
  parishList!: any[];
  teacherList: any = [];
  subtituteTeacherList!: any[];
  schoolId: any;

  teacherGradeDataFormGroup: any;
  substituteTeacherGradeDataFormGroup: any;
  sSchoolDatesData: any;

  userMetaData: any;
  gridApi: any;
  columnDefs!: any[];

  rowData: any;
  term: any;
  gridOptions: any;
  selectedUserData: any;
  userId: any;
  orgId: any;
  selectedUserRole!: any[];
  loggedInUser: any;
  roles: any;
  rolesList!: any[];
  orgName: any;
  teacherGradeData!: any[];
  subteacherGradeData: any;

  selPrincipalData: any;
  selVicePrincipalData: any;
  principalList: any = [];


  sundaySchoolName: any;

  minDate = new Date();
  isPrimary: boolean = false;
  showHidePrincipal: boolean = true;

  schoolStartDate: any;
  schoolEndDate: any;
  principal: any;
  sundaySchoolTermsList: any;
  startDateEndDateData: any;
  TermStartDate: any;
  TermEndDate: any;
  selectedYearData: any;
  startAndEndDatesData!: any[];
  setDateData!: any[];
  staffDataPatchValue: any;



  dropdownSettingsTeacher: any;
  dropdownSettingsSubstituteTeacher: any;
  dropdownSettingsSundaySchoolTermsList: any;
  dropdownSettingsPrincipalId: any;
  selectedTerm: any;




  constructor(private apiService: ApiService,
    private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils,) { }





  dropdownSettingsForPrincipalId: IDropdownSettings = {
    singleSelection: true,
    idField: 'staffId',
    textField: 'staffName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForSundaySchoolTermsList: IDropdownSettings = {
    singleSelection: true,
    idField: 'termDtlId',
    textField: 'term',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };

  dropdownSettingForTeacher: IDropdownSettings = {
    singleSelection: true,
    idField: 'staffId',
    textField: 'staffName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };


  dropdownSettingForSubstituteTeacher: IDropdownSettings = {
    singleSelection: true,
    idField: 'staffId',
    textField: 'staffName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    maxHeight: 100
  };


  ngOnInit(): void {

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.rolesList = this.userMetaData.roles;

    this.dropdownSettingsSundaySchoolTermsList = this.dropdownSettingForSundaySchoolTermsList;
    this.dropdownSettingsTeacher = this.dropdownSettingForTeacher;
    this.dropdownSettingsSubstituteTeacher = this.dropdownSettingForSubstituteTeacher;
    this.dropdownSettingsPrincipalId = this.dropdownSettingsForPrincipalId;



    this.apiService.callGetService(`getSSchools`).subscribe((res: any) => {

      this.rowData = res.data.schoolData;
      //this.teacherGradeData = this.rowData;
      //this.subteacherGradeData = this.rowData;
      //this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData));
      //for (let i = 0; i < this.teacherGradeData.length; i++) {
      //this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData[0].grades));   
      //}


    });

    this.columnDefs = [
      { headerName: 'Sunday School Name', field: 'name', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'Parish Name', field: 'parishName', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
    ];

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



    this.teacherGradeDataFormGroup = this.formBuilder.group({
      teacherGrades: this.formBuilder.array([this.addTeachersData()])
    });





    this.staffDataFormGroup = this.formBuilder.group({
      parish: new FormControl(''),
      sundaySchoolName: new FormControl('', [Validators.required]),
      schoolId: new FormControl(''),
      principal: new FormControl(''),
      vicePrincipal: new FormControl(''),
      sundaySchoolTerm: new FormControl('', [Validators.required]),
      sSchoolStartEndDate: new FormControl('')
    });

  }

  setTeacherAndGrades(teacherGradeData: any[]): FormArray {
    const formArray = new FormArray([]);
    teacherGradeData.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        gradeId: e.gradeId,
        grade: e.grade,
        teacher: [e.primary],
        substituteTeacher: [e.secondary],
        isPrimary: 'true',
        roleType: 'Teacher'
      }));
    });
    return formArray;
  }

  // rolesArr: any[] = [];

  // adduserroles(): FormGroup {
  //   this.rolesArr.push({});
  //   return this.formBuilder.group({
  //     roleId: [null, Validators.required],
  //     role: [null, Validators.required],
  //     orgName: [null, Validators.required]
  //   });
  // }

  addTeachersData(): FormGroup {
    return this.formBuilder.group({
      gradeId: '',
      grade: '',
      teacher: '',
      isPrimary: '',
      roleType: '',
      substituteTeacher: ''
    });
  }


  onGridReady(params: any) {
    this.gridApi = params.api;
  }
  resetForm() {
    this.staffDataFormGroup.reset();
  }

  openModal() {
    $("#imagemodal").modal("show");
  }

  onRowClicked(event: any) {
    $("#imagemodal").modal("show");




    //if(this.rolesList)
    if (this.rolesList.indexOf("Principal") !== -1) { // if logged in user is Principal
      //alert("Value exists!")
      this.showHidePrincipal = false;
      this.staffDataFormGroup.value.principal = this.loggedInUser;
    }
    let rowData = event;
    this.selectedUserData = event.data;
    this.schoolId = event.data.orgId;
    let i = rowData.rowIndex;
    //this.orgId = this.selectedUserData.orgId;



    this.apiService.callGetService(`getuserRecords?type=principal`).subscribe((res: any) => {

      let tempPrincipalList: any = [];
      tempPrincipalList = res.data.metaData;

      this.principalList = [];
      for (let row of tempPrincipalList) {
        let name = row.title + ' ' + row.firstName + ' ' + row.middleNmae + ' ' + row.lastName
        if (row.middleNmae == null) {
          name = row.title + ' ' + row.firstName + ' ' + row.lastName
        }
        let payload: any = {
          "staffId": row.userId,
          "staffName": name
        }
        this.principalList.push(payload);
      }
    });

    this.apiService.callGetService(`getStaffAssmtBySchool?schoolId=${this.schoolId}`).subscribe((res: any) => {


      this.sundaySchoolTermsList = res.data.allTerms;
      this.teacherGradeData = res.data.staffAssignment;
      this.selectedTerm = res.data.selectedTerm;
      //this.selectedPrincipal =  res.data.selectedPrincipal;
      //this.selectedVicePrincipal = res.data.selectedVicePrincipal;

      // let selectedTerms: any = {
      //   "termDtlId": this.selectedTerm[0].termDtlId,
      //   "term": this.selectedTerm[0].term
      // }

      this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData));



      this.staffDataFormGroup.patchValue({
        parish: this.selectedUserData.parishName,
        sundaySchoolName: this.selectedUserData.name,
        schoolId: this.schoolId,
        principal: res.data.principal,
        vicePrincipal: res.data.vicePrincipal,
        sundaySchoolTerm: this.selectedTerm,
        teacher: this.staffDataFormGroup.teacher,
        substituteTeacher: this.staffDataFormGroup.substituteTeacher,
        
      });

      //this.selectedUserRole = this.selectedUserData.roles;
      this.sundaySchoolYearSelChange({ termDtlId: this.selectedTerm[0].termDtlId });


    });



    // this.apiService.callGetService(`getSSchools?role=Vicar`).subscribe((res: any) => {
    //   this.staffDataPatchValue = res.data.schoolData.AllstaffSchoolData;

    //   this.staffDataPatchValue = res.data.schoolData.AllstaffSchoolData;
    //   this.sundaySchoolTermsList = res.data.ssTerms;

    //   this.teacherGradeData.push(this.staffDataPatchValue[0].staffName);


    // });

    this.apiService.callGetService(`getuserRecords?type=teacher`).subscribe((res: any) => {

      let teacherListTemp;
      teacherListTemp = res.data.metaData;

      for (let row of teacherListTemp) {
        let name = row.title + ' ' + row.firstName + ' ' + row.middleNmae + ' ' + row.lastName
        if (row.middleNmae == null) {
          name = row.title + ' ' + row.firstName + ' ' + row.lastName
        }
        let teachers: any = {
          "staffId": row.userId,
          "staffName": name
        }
        this.teacherList.push(teachers);
      }

    });






  }


  sundaySchoolYearSelChange(event: any) {


    let selectedTermFromDropDown: any;

    for (let row of this.sundaySchoolTermsList) {
      if (event.termDtlId == row.termDtlId) {
        selectedTermFromDropDown = row;
      }
    }

    if (selectedTermFromDropDown) {
      this.staffDataFormGroup.patchValue({
        sSchoolStartEndDate: `${selectedTermFromDropDown.startDate} - ${selectedTermFromDropDown.endDate}`
      });
    }

    this.apiService.callGetService(`getStaffAssmtBySchool?schoolId=${this.schoolId}&term=${event.termDtlId}`).subscribe((res: any) => {

      this.teacherGradeData = res.data.staffAssignment;

      this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData));

      
      this.staffDataFormGroup.patchValue({
        principal: res.data.principal,
        vicePrincipal: res.data.vicePrincipal,
      });

    });




    // for getting start date and end date as per sunday school year 

    // for(let i = 0 ; i <this.sundaySchoolTermsList.length ; i++){

    //   if(this.sundaySchoolTermsList[i].termDtlId ==event.value){
    //     this.schoolStartDate = this.sundaySchoolTermsList[i].startDate;
    //     this.schoolEndDate= this.sundaySchoolTermsList[i].endDate;
    //   }
    // }
  }



  saveStaffProfile() {


    this.apiService.callPostService('setStaffAssignment', { ...this.staffDataFormGroup.value, ...this.teacherGradeDataFormGroup.value }).subscribe((res: any) => {
      if (res.data.status == "success") {
        this.uiCommonUtils.showSnackBar("Saved successfully!", "success", 3000);
      }
      else
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
    });

  }

  //miscellaneous
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

}
