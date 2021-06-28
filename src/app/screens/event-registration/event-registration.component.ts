import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { EventRegistrationDataService } from './event.registrationDataService';
import { uiCommonUtils } from '../../common/uiCommonUtils';
//import { EventRegistrationDataService } from './event.RegistrationDataService';

@Component({
  selector: 'app-event-registration',
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css']
})
export class EventRegistrationComponent implements OnInit {

  term: any;
  columnDefs!: any[];
  rowData: any;
  gridOptions: any;
  eventId: any;
  parentValue: any;
  gridApi: any;
  data: any;
  params: any;
  loggedInUser: any;
  userMetaData: any;
  selectedEventType: any;

  constructor(private router: Router, private apiService: ApiService, private uiCommonUtils: uiCommonUtils,
    private eventRegistrationDataService: EventRegistrationDataService) { }

  ngOnInit(): void {

    this.userMetaData = this.uiCommonUtils.getUserMetaDataJson();
    this.loggedInUser = this.userMetaData.userId;


    // this.columnDefs = [
    //   { headerName: 'Event Name', field: 'name', flex: 1, resizable: true, sortable: true, filter: true },
    //   { headerName: 'Event Type', field: 'event_type', flex: 1, resizable: true, sortable: true, filter: true },
    //   {
    //     headerName: 'Event Start Date', field: 'startDate', flex: 1, resizable: true, sortable: true, filter: true,
    //     cellRenderer: (data: any) => {
    //       return data.value ? (new Date(data.value)).toLocaleDateString() : '';
    //     }
    //   },
    //   {
    //     headerName: 'Event End Date', field: 'endDate', flex: 1, resizable: true, sortable: true, filter: true,
    //     cellRenderer: (data: any) => {
    //       return data.value ? (new Date(data.value)).toLocaleDateString() : '';
    //     },
    //   },
    // ];




    this.onFilteringRadioButtonChange({ value: 'upcoming_events' });


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

    this.gridOptions.api.sizeColumnsToFit();
  
  }

  onFilteringRadioButtonChange(event: any) {
    console.log("my event : " + event.value)
    this.selectedEventType = event.value;
    console.log("event type is : " + this.selectedEventType);
    this.getAllEventsData(event.value);



    if (event.value == "upcoming_events") {
      this.columnDefs = [
        { headerName: 'Event Name', field: 'name', width:440, resizable: true, sortable: true, filter: true },
        { headerName: 'Event Type', field: 'event_type', width:200, resizable: true, sortable: true, filter: true },
        {
          headerName: 'Registration Deadline', field: 'registrationEndDate',width:200, resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          },
        },
        {
          headerName: 'Event Date', field: 'startDate',  resizable: true,width:200, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          }
        },
      ];
    }
    if (event.value == "registered_events") {
      this.columnDefs = [
        { headerName: 'Event Name', field: 'name', width:200, resizable: true, sortable: true, filter: true },
        { headerName: 'Event Type', field: 'event_type',  width:200, resizable: true, sortable: true, filter: true },
        {
          headerName: 'Registration Deadline', field: 'registrationEndDate', width:200, resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          },
        },
        {
          headerName: 'Event Date', field: 'startDate', width:200,  resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          }
        },
        {
          headerName: 'Registered On', field: 'registeredOn', width:200,  resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          }
        },
        { headerName: 'Registered By', field: 'registeredBy', width:200, resizable: true, sortable: true, filter: true },
        { headerName: 'Registration Id', field: 'registrationId', width:200, resizable: true, sortable: true, filter: true },
        { headerName: 'Registration Status', field: 'registrationStatus', width:200, resizable: true, sortable: true, filter: true },
        { headerName: 'Participant Name', field: 'participantName', width:200, resizable: true, sortable: true, filter: true },
      ];
    }
    if (event.value == "completed_events") {
      this.columnDefs = [
        { headerName: 'Event Name', field: 'name', width:200, resizable: true, sortable: true, filter: true },
        { headerName: 'Event Type', field: 'event_type', width:200,resizable: true, sortable: true, filter: true },
        {
          headerName: 'Event Date', field: 'startDate', width:200, resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          }
        },
        { headerName: 'Registration Id', width:200, field: 'registrationId', resizable: true, sortable: true, filter: true },
        { headerName: 'Participant Name', width:200, field: 'participantName',  resizable: true, sortable: true, filter: true },
        { headerName: 'Result', field: '', width:200,  resizable: true, sortable: true, filter: true },
      ];

    }
  }



  getAllEventsData(eventType: string) {
    this.apiService.callGetService('getEventData?eventType=' + eventType).subscribe((res) => {
      this.rowData = res.data.metaData.eventData;
    });
  }

  agInit(params: any) {
    this.params = params;
    this.data = params.value;
  }

  getEventDataForRegistration() {
    this.apiService.callGetService('getEventForRegistration').subscribe((res) => {
      console.log('These are all the events from database For Registration : ');
      console.log(res.data.metaData);
      this.rowData = res.data.metaData.eventData;
      this.eventId = res.data.metaData.eventData[0].event_Id;
      console.log("Event Id is : " + this.eventId);

      //this.events = this.rowData
    });
  }
  
  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onRowClicked(event: any) {
    //this.router.navigate(['/dashboard/editevent']);
    //this.router.navigate(['/dashboard/createevent/',event]);
    console.log("Event data : " + event.data);
    this.eventRegistrationDataService.getDataService().setSelectedRowData(event.data);
    this.parentValue = this.router.navigate(['/dashboard/cwcregistration/', this.selectedEventType]);

    //this.eventRegistrationDataService.getDataService().setselectedEventData(event.value);
    //this.parentValue = this.router.navigate(['/dashboard/cwcregistration/']);
    //this.parentValue = 'this.child';

  }


}
