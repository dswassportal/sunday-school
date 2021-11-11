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

  }

  onFilteringRadioButtonChange(event: any) {
    console.log("my event : " + event.value)
    this.selectedEventType = event.value;
    console.log("event type is : " + this.selectedEventType);
    this.getAllEventsData(event.value);

    if (event.value == "upcoming_events") {
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
    if (event.value == "registered_events") {
      this.columnDefs = [
        { headerName: 'Event Name', field: 'name', width: 200, resizable: true, sortable: true, filter: true },
        { headerName: 'Event Type', field: 'event_type', width: 200, resizable: true, sortable: true, filter: true },
        {
          headerName: 'Registration Deadline', field: 'registrationEndDate', width: 200, resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          },
        },
        {
          headerName: 'Event Date', field: 'startDate', width: 200, resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          }
        },
        {
          headerName: 'Registered On', field: 'registeredOn', width: 200, resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          }
        },
        { headerName: 'Registered By', field: 'registeredBy', width: 200, resizable: true, sortable: true, filter: true },
        { headerName: 'Registration Id', field: 'registrationId', width: 200, resizable: true, sortable: true, filter: true },
        { headerName: 'Registration Status', field: 'registrationStatus', width: 200, resizable: true, sortable: true, filter: true },
        { headerName: 'Participant Name', field: 'participantName', width: 200, resizable: true, sortable: true, filter: true },
        { headerName: 'Score', field: 'overallScore', width: 400, resizable: true, sortable: true, filter: true },
        //{ headerName: 'Category', field: 'category', width:200, resizable: true, sortable: true, filter: true },
      ];
    }
    if (event.value == "completed_events") {
      this.columnDefs = [
        { headerName: 'Event Name', field: 'name', width: 200, resizable: true, sortable: true, filter: true },
        { headerName: 'Event Type', field: 'event_type', width: 200, resizable: true, sortable: true, filter: true },
        {
          headerName: 'Event Date', field: 'startDate', width: 200, resizable: true, sortable: true, filter: true,
          cellRenderer: (data: any) => {
            return data.value ? (new Date(data.value)).toLocaleDateString() : '';
          }
        },
        { headerName: 'Registration Id', width: 200, field: 'registrationId', resizable: true, sortable: true, filter: true },
        { headerName: 'Participant Name', width: 200, field: 'participantName', resizable: true, sortable: true, filter: true },
        { headerName: 'Result', field: '', width: 200, resizable: true, sortable: true, filter: true },
      ];

    }
  }



  getAllEventsData(eventType: string) {
    if (eventType == "registered_events") {
      this.apiService.callGetService('getEventData?eventType=' + eventType).subscribe((res) => {
        console.log("res.data.metaData.eventData", res.data.metaData.eventData);

        let scoreData: any = [];
        if(res.data.metaData.eventData){
          for (let row of res.data.metaData.eventData) {

            let index = scoreData.findIndex((item: any) => item.event_Id == row.event_Id);
            console.log("index", index);
            if (index <= 0) {
              let json = {
                "event_Id": row.event_Id,
                "name": row.name,
                "event_type": row.event_type,
                "startDate": row.startDate,
                "endDate": row.endDate,
                "registrationStartDate": row.registrationStartDate,
                "registrationEndDate": row.registrationEndDate,
                "participantId": row.participantId,
                "participantName": row.participantName,
                "registrationId": row.registrationId,
                "registrationStatus": row.registrationStatus,
                "registeredBy": row.registeredBy,
                "registeredOn": row.registeredOn,
                "overallScore": row.category == "Sunday School Midterm Exam" || row.category == "Sunday School Final Exam" ? "Exam marks:" + ' ' + row.overallScore :
                  row.category == null ? ' ' : row.category + ': ' + row.overallScore,
              }
              scoreData.push(json);
            }
            if (index > 0) {
              let index = scoreData.findIndex((item: any) => item.event_Id == row.event_Id);
              let existingCat = scoreData[index].overallScore;
              let newCat = existingCat + ', ' + row.category + ': ' + row.overallScore;
              scoreData[index].overallScore = newCat;
            }
          }
          this.rowData = scoreData;
        }
        else{
          this.rowData = [];
        }

        //this.rowData = res.data.metaData.eventData;
       
      });
    }
    else {
      this.apiService.callGetService('getEventData?eventType=' + eventType).subscribe((res) => {
        this.rowData = res.data.metaData.eventData;
      });
    }
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

  
  onBtExport() {
    // this.gridApi.exportDataAsExcel();
    const params = {
      columnGroups: true,
      allColumns: true,
      fileName: `event_list`,
    };
    this.gridApi.exportDataAsCsv(params);
  }


}
