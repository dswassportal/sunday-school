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
  subtituteTeacherList!:any[];
  
  teacherGradeDataFormGroup : any;
  substituteTeacherGradeDataFormGroup:any;
  sSchoolDatesData:any;
  
  userMetaData: any;
  gridApi:any;
  columnDefs!:any[];
  
  rowData: any ;
  term: any;
  gridOptions:any;
  selectedUserData: any;
  userId: any;
  orgId:any;
  selectedUserRole!: any[];
  loggedInUser: any;
  roles:any;
  rolesList!: any[];
  orgName:any;
  teacherGradeData!:any [];
  subteacherGradeData:any;
  principalData:any;
  principalList!:any[];
  
  sundaySchoolName:any;
  
  minDate = new Date();
  isPrimary: boolean = false;
  showHidePrincipal:boolean = true;

  schoolStartDate : any;
  schoolEndDate : any;
  principalId : any;
  staffId : any;
  subStaffId : any;
  sundaySchoolTermsList:any;
  startDateEndDateData:any;
  TermStartDate:any;
  TermEndDate:any;
  selectedYearData:any;
  startAndEndDatesData!:any[];
  setDateData!:any[];
 
  staffDataPatchValue:any;
  constructor(private apiService: ApiService,
      private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils,) { }

  ngOnInit(): void {

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;
    this.orgName = this.userMetaData.orgName;
    
    window.onunload = function() { debugger; }

    this.rolesList = this.userMetaData.roles;

      this.rolesList = this.userMetaData.roles;
    
    this.apiService.callGetService(`getSSchools?role=Vicar`).subscribe((res: any) => {

      
      this.rowData =  res.data.schoolData;

      for(let school of this.rowData){
          school.parish = this.orgName;
      }      
      
      this.teacherGradeData = this.rowData;
      this.subteacherGradeData = this.rowData;
      
      //this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData));
      
      //for (let i = 0; i < this.teacherGradeData.length; i++) {
        
        this.teacherGradeDataFormGroup.setControl('teacherGrades', this.setTeacherAndGrades(this.teacherGradeData[0].grades));   
           
        
      //}
   
      
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



    this.teacherGradeDataFormGroup = this.formBuilder.group({
      teacherGrades: this.formBuilder.array([this.addTeachersData()])
    });

    
  
    
   
    this.staffDataFormGroup = this.formBuilder.group({
      
      name: new FormControl('', [Validators.required]), 
      gradeId: new FormControl('', [Validators.required]), 
      schoolStartDate: new FormControl('', [Validators.required]),
      schoolEndDate : new FormControl('', [Validators.required]),
      principalId : new FormControl(''),
      
      vicePrincipalId : new FormControl('',),
      parish : new FormControl(''),
      roles: this.formBuilder.array([this.adduserroles()], [Validators.required]),
      
      staffId :  new FormControl(''),
      subStaffId:new FormControl(''),
      sundaySchoolTerm: new FormControl('', [Validators.required]),
      sSchoolStartEndDate:new FormControl('')
      

    });

    
  }
  
  setTeacherAndGrades(teacherGradeData: any[]): FormArray {
    const formArray = new FormArray([]);
    teacherGradeData.forEach((e: any) => {
      formArray.push(this.formBuilder.group({
        gradeId : e.orgId,
        name: e.name,
        staffId: e.staffId,
        isPrimary:'true',
        roleType:'Teacher',
      subStaffId:e.subStaffId
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
      gradeId:'',
        name: '',
        staffId: '',
        isPrimary : '',
        roleType:'',
        subStaffId:'',
        
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

    //if(this.rolesList)
    if(this.rolesList.indexOf("Principal") !== -1){ // if logged in user is Principal
      //alert("Value exists!")
      this.showHidePrincipal = false;
      this.staffDataFormGroup.value.principalId = this.loggedInUser;
    }
    let rowData = event;
    this.selectedUserData = event.data;
    
    let i = rowData.rowIndex;
    this.orgId = this.selectedUserData.orgId;

    this.apiService.callGetService(`getuserRecords?type=principal`).subscribe((res: any) => {
      
      this.principalList = res.data.metaData;
      
    });

    this.apiService.callGetService(`getSSchools?role=Vicar`).subscribe((res: any) => {
      this.staffDataPatchValue = res.data.schoolData.AllstaffSchoolData;

      this.staffDataPatchValue = res.data.schoolData.AllstaffSchoolData;
      this.sundaySchoolTermsList = res.data.ssTerms;
    
      this.teacherGradeData.push(this.staffDataPatchValue[0].staffName);

    
    });
    
    this.apiService.callGetService(`getuserRecords?type=teacher`).subscribe((res: any) => {
      
          this.teacherList = res.data.metaData;
          
    });
 
    this.staffDataFormGroup.patchValue({
      name: this.selectedUserData.name,
      parish : this.selectedUserData.parish,
      principalId:this.staffDataFormGroup.principalName,
      sundaySchoolTerm:this.staffDataFormGroup.sundaySchoolTerm,
      schoolStartDate: this.staffDataFormGroup.schoolStartDate,
      schoolEndDate : this.staffDataFormGroup.schoolEndDate,
      //principalId:this.staffDataFormGroup.principalId,
      staffId : this.staffDataFormGroup.staffId,
      subStaffId:this.staffDataFormGroup.subStaffId
      

    });
    
    this.selectedUserRole = this.selectedUserData.roles;
    
    
  }

  saveStaffProfile(){

    
    let staff_list = [];
    
    for( let staffMember of this.teacherGradeDataFormGroup.value.teacherGrades){
      
      if(staffMember.roleType == "Teacher"){
          
          staff_list.push({
            gradeId: staffMember.gradeId,
            staffId: staffMember.staffId,
            isPrimary: true,
            roleType: "Teacher"
          });
          
          staff_list.push({
            gradeId: staffMember.gradeId,
            staffId: staffMember.subStaffId,
            isPrimary: false,
            roleType: "Teacher"
          });
          
      }
        // if logged in user is not Principal      
      if(staffMember.roleType !="Teacher" && this.staffDataFormGroup.value.principalId != null){
      staff_list.push({
          //gradeId: staffMember.gradeId,
          //schoolId:this.orgId,
          gradeId:this.orgId,
          //schoolId:this.orgId,
          staffId: this.staffDataFormGroup.value.principalId,
          isPrimary: true,
          roleType: "Sunday School Principal"
        });
        
      }
      if(staffMember.roleType != "Teacher" && this.staffDataFormGroup.value.vicePrincipalId!=null){
        staff_list.push({
          //gradeId: staffMember.gradeId,
          //schoolId:this.orgId,
          gradeId:this.orgId,
          //schoolId:this.orgId,
          staffId: this.staffDataFormGroup.value.vicePrincipalId,
          isPrimary: true,
          roleType: "Sunday School Vice Principal"
        });
      }
    
     
     
     else if(this.rolesList.indexOf("Principal") !== -1){  // if logged in user is a Principal
      staff_list.push({
        gradeId: staffMember.gradeId,
        subStaffId: this.loggedInUser,
        isPrimary: true,
        roleType: "Principal"
      });
     }
     
    }
   
    
   let payload = {

    //ssStartDate: this.staffDataFormGroup.value.schoolStartDate,
    //ssEndDate : this.staffDataFormGroup.value.schoolEndDate,

    ssStartDate: this.schoolStartDate,
    ssEndDate : this.schoolEndDate,
    schoolId: this.orgId,

    staffAssignment : staff_list
    
  }
    console.log("payLoad is " + payload);
    

    
    this.apiService.callPostService('setStaffAssignment',payload).subscribe((res: any) => {
      if (res.data.status == "success") {
        this.uiCommonUtils.showSnackBar("Saved successfully!", "success", 3000);
      }
      else
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
    });
    
  }
  sundaySchoolSelChange(event:any){
      // for getting start date and end date as per sunday school year 
      
      for(let i = 0 ; i <this.sundaySchoolTermsList.length ; i++){

        if(this.sundaySchoolTermsList[i].termDtlId ==event.value){
          this.schoolStartDate = this.sundaySchoolTermsList[i].startDate;
          this.schoolEndDate= this.sundaySchoolTermsList[i].endDate;
        }
      }
      
      
  }  

}
