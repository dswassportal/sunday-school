import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { uiCommonUtils } from 'src/app/common/uiCommonUtils';
import { ApiService } from 'src/app/services/api.service';
import { SchoolAttendance } from '../school-attendance/school-attendance.dataService';

import { Moment } from 'moment';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';

const moment = _rollupMoment || _moment;

class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    var formatString = ' MMMM DD YYYY';
    return moment(date).format(formatString);
  }
}

@Component({
  selector: 'app-sunday-school-attendance',
  templateUrl: './sunday-school-attendance.component.html',
  styleUrls: ['./sunday-school-attendance.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: CustomDateAdapter
    }
  ]
})
export class SundaySchoolAttendanceComponent implements OnInit {

  constructor(private router: Router,
    private formBuilder: FormBuilder, private uiCommonUtils: uiCommonUtils,
    private schoolAttendanceDataService: SchoolAttendance, private apiService: ApiService) { }

  gradeData: any;
  dropdownSettingsGrades: any;
  sundaySchoolAttendanceForm: any;
  columnDefs!: any[];
  gridOptions: any;
  rowData: any;
  maxDate = new Date();
  selectedRowJson: any = {};
  studentAttendanceGridApi: any;
  userMetaData: any;
  loggedInUser: any;
  termData: any;
  formattedDate: any;

  dropdownSettingForGrades: IDropdownSettings = {
    singleSelection: true,
    idField: 'gradeId',
    textField: 'gradeName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 10,
    allowSearchFilter: true,
    maxHeight: 100
  };

  ngOnInit(): void {

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;

    if (this.schoolAttendanceDataService.getSelectedRowData() != undefined) {
      this.selectedRowJson = this.schoolAttendanceDataService.getSelectedRowData();
      console.log('selected row data is :: ' + JSON.stringify(this.selectedRowJson));
    }

    this.sundaySchoolAttendanceForm = this.formBuilder.group({
      schoolName: new FormControl(''),
      schoolTerm: new FormControl(''),
      grades: new FormControl(''),
      attendanceDate: new FormControl('')
    });

    let recentSundayDate = moment().startOf('week');
    let convertedRecentSundayDate = recentSundayDate.toLocaleString();

    this.sundaySchoolAttendanceForm.patchValue({
      schoolName: this.selectedRowJson.schoolName,
      grades: this.selectedRowJson.grades,
      attendanceDate: formatDate(convertedRecentSundayDate.split(',')[0].trim(), 'yyyy-MM-dd', 'en')
    });

    this.formattedDate = convertedRecentSundayDate;
    this.formattedDate = formatDate(this.formattedDate, 'yyyy-MM-dd', 'en');

    this.gradeData = this.selectedRowJson.grades;
    this.dropdownSettingsGrades = this.dropdownSettingForGrades;

    this.columnDefs = [
      { headerName: 'Student Name', field: 'student_name', width: 530, resizable: true, sortable: true, filter: true, headerCheckboxSelection: true, checkboxSelection: true },
      { headerName: 'Student Id', field: 'student_id', width: 530, resizable: true, sortable: true, filter: true },
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

    this.apiService.callGetService(`getAssignedGrades`).subscribe((res) => {
      this.termData = res.data.currentTerm;

      this.sundaySchoolAttendanceForm.patchValue({
        schoolTerm: this.termData.termYear
      });
    });





    this.apiService.callGetService(`getGradeAttendance?schoolId=${this.selectedRowJson.schoolId}&grade=${this.selectedRowJson.grades[0].gradeId}&date=${this.formattedDate}`).subscribe((res) => {
      // this.rowData = res.data.attendanceData;
      this.studentAttendanceGridApi.setRowData(res.data.attendanceData);
      this.studentAttendanceGridApi.forEachNode(
        (node: any) => {
          if (node.data.has_attended !== null)
            node.setSelected(node.data.has_attended)
        });
 
      });
  }


  onCancelClick() {
    this.router.navigate(['/dashboard/schoolAttendance']);
  }

  dateChange(event: any) {


    this.formattedDate = event.value;
    this.formattedDate = formatDate(this.formattedDate, 'yyyy-MM-dd', 'en');

    let gradeId: any;
    if (this.sundaySchoolAttendanceForm.value.grades[0].gradeId) {
      gradeId = this.sundaySchoolAttendanceForm.value.grades[0].gradeId;
    }

    this.apiService.callGetService(`getGradeAttendance?schoolId=${this.selectedRowJson.schoolId}&grade=${gradeId}&date=${this.formattedDate}`).subscribe((res) => {
      // this.rowData = res.data.attendanceData;
      this.studentAttendanceGridApi.setRowData(res.data.attendanceData);
      this.studentAttendanceGridApi.forEachNode(
        (node: any) => {
          if (node.data.has_attended !== null)
            node.setSelected(node.data.has_attended)
        });
    });
  }

  onSaveClick() {

    let finalGridData: any = [];
    let selectedGridData = this.studentAttendanceGridApi.getSelectedRows();
    // let allGridData = this.rowData;

    for (let row of selectedGridData) {
      let gridData =
      {
        "student_id": row.student_id,
        "has_attended": true
      }
      finalGridData.push(gridData);
    }

    // for (let row of allGridData) {
    //   let index = finalGridData.findIndex((item: any) => item.student_id === row.student_id);
    //   if (index == -1) {
    //     let gridData =
    //     {
    //       "student_id": row.student_id,
    //       "has_attended": false
    //     }
    //     finalGridData.push(gridData);
    //   }
    // }

    let gradeId: any;
    if (this.sundaySchoolAttendanceForm.value.grades[0].gradeId) {
      gradeId = this.sundaySchoolAttendanceForm.value.grades[0].gradeId;
    }


    let payload = {

      "teacherId": this.loggedInUser,
      "schoolId": this.selectedRowJson.schoolId,
      "gradeId": gradeId,
      "termRefId": this.termData.termDtlId,
      "attendanceDate": this.formattedDate,
      "attendance": finalGridData
    }

    // console.log("payload", payload);

    this.apiService.callPostService(`postSSAttendance`, payload).subscribe((res) => {
      if (res.data.status == "success") {
        this.uiCommonUtils.showSnackBar("Saved successfully!", "success", 3000);
        finalGridData = [];
      }
      else {
        this.uiCommonUtils.showSnackBar("Something went wrong!", "error", 3000);
        finalGridData = [];
      }
    });


  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 1 && day !== 2 && day !== 3 && day !== 4 && day !== 5;
  }

  //miscellaneous
  onItemSelect(item: any) {
    console.log(item);
  }

  onSelectAll(items: any) {
    console.log(items);
  }

  onGridReady(params: any) {
    this.studentAttendanceGridApi = params.api;
  }

}
