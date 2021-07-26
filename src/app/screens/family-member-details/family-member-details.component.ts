import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { uiCommonUtils } from '../../common/uiCommonUtils';
import { FamilyMemberDetails } from './family-member-details.dataService';

@Component({
  selector: 'app-family-member-details',
  templateUrl: './family-member-details.component.html',
  styleUrls: ['./family-member-details.component.css']
})
export class FamilyMemberDetailsComponent implements OnInit {

  constructor(private router: Router, private apiService: ApiService, private uiCommonUtils: uiCommonUtils,
    private familyMemberDetails : FamilyMemberDetails) { }

  
  columnDefs!: any[];
  rowData: any;
  gridOptions: any;
  selectedEventType: any;
  alluserdata: any;

  ngOnInit(): void {

    this.alluserdata = this.uiCommonUtils.getUserMetaDataJson();

    console.log("this.alluserdata", this.alluserdata);

    this.rowData = this.alluserdata.memberDetails;

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

    this.columnDefs = [
      { headerName: 'Title', field: 'title', resizable: true, sortable: true, filter: true },
      { headerName: 'First Name', field: 'firstName', flex:1, resizable: true, sortable: true, filter: true },
      { headerName: 'Middle Name', field: 'middleName', resizable: true, sortable: true, filter: true },
      { headerName: 'Last Name', field: 'lastName', resizable: true, sortable: true, filter: true },
      { headerName: 'Relationship', field: 'relationship',flex:1, resizable: true, sortable: true, filter: true },

    ];

  }

  onGridReady(params: any) {
    //this.gridApi = params.api;
  }

  onRowClicked(event: any) {

    console.log("Event data : " + event.data);
    this.familyMemberDetails.getDataService().setSelectedRowData(event.data);
    //this.parentValue = this.router.navigate(['/dashboard/bulkRegistration/']);
    this.router.navigate(['/dashboard/memberDetails']);
  }

  
}
