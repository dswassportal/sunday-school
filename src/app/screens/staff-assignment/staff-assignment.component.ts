import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  teacherList!: any[];
  eventList!: any[];
  teacherGradeDataFormGroup : any;
  eventCategorydData!: any[];
  userMetaData: any;
  gridApi:any;
  columnDefs!:any[];
  //rowData: any = [];
  rowData: any ;
  term: any;
  gridOptions:any;
  selectedUserData: any;
  userId: any;
  selectedUserRole!: any[];
  loggedInUser: any;
  roles:any;
  rolesList!: any[];
  orgName:any;
  teacherGradeData:any;
  principalData:any;
  principalList!:any[];
  //sundaySchoolName!:any [];
  sundaySchoolName:any;
  maxDate = new Date();
  minDate = new Date();
  constructor(private apiService: ApiService,
      private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils,) { }

  ngOnInit(): void {

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.orgName = this.userMetaData.orgName;
    

    this.rolesList = this.userMetaData.roles;

    for (let i = 0; i < this.userMetaData.roles.length; i++) {
      this.rolesList = this.userMetaData.roles;
    }
    
    
    this.apiService.callGetService(`getSShools?role=vicar`).subscribe((res: any) => {
      //this.rowData = res.data.schoolData;
      //this.gridOptions.rowData.push(this.orgName)
     
      //this.principalData =  res.data.schoolData.principalName;
      
      this.rowData =  res.data.schoolData;

      for(let school of this.rowData){
          school.parish = this.orgName;
      }      
      
      this.teacherGradeData = this.rowData;
      //this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData));
      
      for (let i = 0; i < this.teacherGradeData.length; i++) {
        this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData[i].grades));   
      }

      
    });

    this.columnDefs = [
      { headerName: 'Sunday School Name', field: 'name', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true },
      { headerName: 'Parish Name', field: 'parish', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true},
      
    ];
   
    this.gridOptions = {
      columnDefs: this.columnDefs,
      rowData:this.rowData,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };

    this.apiService.callGetService('getParishData').subscribe((res: any) => {
      for(let i=0;i<res.data.metaData.Parish.length;i++){
        this.parishList = res.data.metaData.Parish;
      }
    });

    this.apiService.callGetService('getEventType').subscribe((res: any) => {
      this.eventList = res.data.metaData.eventType;
      this.eventCategorydData = res.data.metaData.eventType;
    });

    this.teacherGradeDataFormGroup = this.formBuilder.group({
      teacherGrades: this.formBuilder.array([this.addTeachersData()])
    });

    this.staffDataFormGroup = this.formBuilder.group({
      //orgName: new FormControl('',Validators.required),
      name: new FormControl('', [Validators.required]), 
      schoolStartDate: new FormControl('', [Validators.required]),
      schoolEndDate : new FormControl('', [Validators.required]),
      principalName : new FormControl(''),
      vicePrincipalName : new FormControl('',),
      parish : new FormControl(''),
      roles: this.formBuilder.array([this.adduserroles()], [Validators.required]),

    });

    
  }

  setTeacherAndGrades(teacherGradeData: any): FormArray {
    const formArray = new FormArray([]);
    teacherGradeData.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        name: e.name,
        teacherName: e.teacherName,
        substituteTeacher:e.substituteTeacher
      }));
    });
    return formArray;
  }
  rolesArr: any[] = [];

  adduserroles(): FormGroup {
    this.rolesArr.push({});
    return this.formBuilder.group({
      roleId: [null, Validators.required],
      role: [null, Validators.required],
      orgName: [null, Validators.required]
    });
  }
  addTeachersData(): FormGroup {
    return this.formBuilder.group({
        name: '',
        teacherName: '',
        substituteTeacher:''
    });
  }
  onGridReady(params:any) {
    this.gridApi = params.api;
  }
  resetForm() {
    this.staffDataFormGroup.reset();
  }
  openModal() {
    $("#imagemodal").modal("show");
  }
  onRowClicked(event:any){
    $("#imagemodal").modal("show");

    let rowData = event;
    this.selectedUserData = event.data;
    
    let i = rowData.rowIndex;
    this.userId = this.selectedUserData.userId;

    this.apiService.callGetService(`getSShools?role=vicar`).subscribe((res: any) => {
      //console.log(res.data.schoolData);
      for(let i=0;i<res.data.schoolData.length;i++){
          if (res.data.schoolData != null) {
          this.principalList = res.data.schoolData;
        }
      }
    });
    
    this.staffDataFormGroup.patchValue({
      name: this.selectedUserData.name,
      //orgId : this.selectedUserData.OrgId,
      //orgName:this.selectedUserData.orgName,
      //principalName:this.selectedUserData.principalName,
      parish : this.selectedUserData.parish
    });

    this.selectedUserRole = this.selectedUserData.roles;

    
  }

  saveStaffProfile(){
    if (this.staffDataFormGroup.invalid) {
      return
    }else if (this.staffDataFormGroup.value.roles.length == 0) {
      this.uiCommonUtils.showSnackBar('User should have atleast one Role', 'Dismiss', 3000);
    }

  }

  comparisonEventStartdateValidator(): any {

    let schoolStartDate = this.staffDataFormGroup.value['schoolStartDate'];
    let schoolEndDate = this.staffDataFormGroup.value['schoolEndDate'];

    let eventstartnew = new Date(schoolStartDate);
    let eventendnew = new Date(schoolEndDate);
    if (eventstartnew > eventendnew) {
      return this.staffDataFormGroup.controls['schoolStartDate'].setErrors({ 'invaliddaterange': true });
    }

  }

  comparisonEventEnddateValidator(): any {

    let schoolStartDate = this.staffDataFormGroup.value['schoolStartDate'];
    let schoolEndDate = this.staffDataFormGroup.value['schoolEndDate'];

    if (schoolStartDate > schoolEndDate) {
      return this.staffDataFormGroup.controls['schoolEndDate'].setErrors({ 'invaliddaterange': true });
    }
  

  }

}
