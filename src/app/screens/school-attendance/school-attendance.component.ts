import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SchoolAttendance } from './school-attendance.dataService';

@Component({
  selector: 'app-school-attendance',
  templateUrl: './school-attendance.component.html',
  styleUrls: ['./school-attendance.component.css']
})
export class SchoolAttendanceComponent implements OnInit {

  constructor(private schoolAttendance : SchoolAttendance,
    private router: Router, private apiService: ApiService) { }

  columnDefs!: any[];
  rowData: any;
  gridOptions: any;

  ngOnInit(): void {

    this.apiService.callGetService(`getAssignedGrades`).subscribe((res) => {
      this.rowData = res.data.schools;
    });
    
    this.columnDefs = [
      { headerName: 'School Name', field: 'schoolName', width: 1110, resizable: true, sortable: true, filter: true },
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

  }
  
  onGridReady(params: any) {
    //this.gridApi = params.api;
  }

  onRowClicked(event: any) {

    console.log("Event data : " + event.data);
    this.schoolAttendance.getDataService().setSelectedRowData(event.data);
    this.router.navigate(['/dashboard/sundaySchoolAttendance']);
  }
}
