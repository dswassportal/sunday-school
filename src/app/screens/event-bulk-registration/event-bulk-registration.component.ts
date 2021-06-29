import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { uiCommonUtils } from '../../common/uiCommonUtils';
import { EventBulkRegistration } from './event-bulk-registration.dataService';

@Component({
  selector: 'app-event-bulk-registration',
  templateUrl: './event-bulk-registration.component.html',
  styleUrls: ['./event-bulk-registration.component.css']
})

export class EventBulkRegistrationComponent implements OnInit {

  constructor(private router: Router, private apiService: ApiService, private uiCommonUtils: uiCommonUtils,
    private eventBulkDataService: EventBulkRegistration) { }


  columnDefs!: any[];
  rowData: any;
  gridOptions: any;
  selectedEventType: any;

  ngOnInit(): void {

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
    this.onFilteringRadioButtonChange({ value: 'upcoming_events' });
  }


  onFilteringRadioButtonChange(event: any) {
    console.log("my event : " + event.value)
    this.selectedEventType = event.value;
    console.log("event type is : " + this.selectedEventType);
    this.getAllEventsData(event.value);


    this.columnDefs = [
      { headerName: 'Event Name', field: 'name', width: 440, resizable: true, sortable: true, filter: true },
      { headerName: 'Event Type', field: 'event_type', width: 200, resizable: true, sortable: true, filter: true },
      {
        headerName: 'Registration Deadline', field: 'registrationEndDate', width: 200, resizable: true, sortable: true, filter: true,
        cellRenderer: (data: any) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        },
      },
      {
        headerName: 'Event Date', field: 'startDate', resizable: true, width: 200, sortable: true, filter: true,
        cellRenderer: (data: any) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
    ];
  }


  getAllEventsData(eventType: string) {
    this.apiService.callGetService('getEventData?eventType=' + eventType).subscribe((res) => {
      //this.rowData = res.data.metaData.eventData;
      let allTTCEvents = [];
      for (let row of res.data.metaData.eventData) {
        if (row.event_type == "TTC") {
          allTTCEvents.push(row);
        }
      }
      this.rowData = allTTCEvents;
    });
  }

  onGridReady(params: any) {
    //this.gridApi = params.api;
  }

  onRowClicked(event: any) {

    console.log("Event data : " + event.data);
    this.eventBulkDataService.getDataService().setSelectedRowData(event.data);
    //this.parentValue = this.router.navigate(['/dashboard/bulkRegistration/']);
    this.router.navigate(['/dashboard/bulkRegistration']);
  }

}
