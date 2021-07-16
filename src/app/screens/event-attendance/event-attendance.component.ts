import { Component, OnInit } from '@angular/core';
import { uiCommonUtils } from '../../common/uiCommonUtils'
import { ApiService } from '../../services/api.service'

declare let $: any;


@Component({
  selector: 'app-event-attendance',
  templateUrl: './event-attendance.component.html',
  styleUrls: ['./event-attendance.component.css']
})
export class EventAttendanceComponent implements OnInit {

  data: any;
  params: any;
  eventColumnDefs: any;
  eventRowData: any;
  term: any;
  eventGridOption: any;
  selectedCategory: string = '';

  categoriesArr: any = [];

  attendanceColDef: any;
  attendanceRowData: any;
  attendanceGridOption: any;
  gridApi: any;
  disableSaveSubmitBtn: boolean = false;


  constructor(private apiService: ApiService, private uiCommonUtils: uiCommonUtils) { }

  ngOnInit(): void {

    this.eventGridOption = {
      columnDefs: this.eventColumnDefs,
      rowData: this.eventRowData,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      enableBrowserTooltips: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };

    this.attendanceGridOption = {
      columnDefs: this.attendanceColDef,
      rowData: this.attendanceRowData,
      treeData: true,
      enableFilter: true,
      singleClickEdit: true,
      enableColResize: true,
      rowSelection: 'multiple',
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };

    this.eventColumnDefs = [
      { headerName: 'Event Name', field: 'name', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Event Type', field: 'event_type', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Start Date', field: 'startDate', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true,
        cellRenderer: (data: any) => {
        return data.value ? (new Date(data.value)).toLocaleDateString() : '';
      },
     },
      { headerName: 'End Date', field: 'endDate', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true,
        cellRenderer: (data: any) => {
        return data.value ? (new Date(data.value)).toLocaleDateString() : '';
      },
    },
    ];

    this.attendanceColDef = [
      { headerName: 'Registration Id', field: 'enrollmentId', headerCheckboxSelection: true, checkboxSelection: true, suppressSizeToFit: true, resizable: true, sortable: true, filter: true, },
      { headerName: 'Participant Name', field : 'participantName', resizable: true, flex : 1 },
      { headerName: 'Group', field : 'grade', resizable: true, suppressSizeToFit: true},
      { headerName: 'Role', field : 'role', resizable: true, suppressSizeToFit: true},
      { headerName: 'Participant Parish', field : 'participantParish', resizable: true, flex : 1 },
    ];

    //cellRendererFramework: CheckboxRendererComponent, field: 'hasAttended', editable: false 
    let userId = this.uiCommonUtils.getUserMetaDataJson().userId
    this.apiService.callGetService(`getEventData?user=${userId}&eventType==attendance`).subscribe((respData) => {

      if (respData.data.status == 'failed') {
        this.eventRowData = []
        this.categoriesArr = []
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      }

      if (respData.data.metaData) {
        
        this.eventRowData = respData.data.metaData.eventData
      } else
        this.eventRowData = [];

    });

  }


  openModal() {
    $("#imagemodal").modal("show");
  }
  selectedEvent: any = {};
  onRowClicked(event: any) {

    $("#imagemodal").modal("show");
    this.attendanceRowData = []
    this.selectedEvent = event.data;
    console.log("Selected Event : " + this.selectedEvent);
    this.categoriesArr = event.data.catagories;
    //this.selectedCategory = event.data.catagories[0].catId;
   

    this.getParicipantData(this.selectedEvent.event_Id, this.selectedCategory)
  }

  handleAttendanceSubmitBtnClick(event: any) {

    let confmMsgSt = `Attendance cannot be updated after submission, Please click \'Ok\' to proceed.`;
    if (confirm(confmMsgSt)) {
      this.handleAttendanceSaveBtnClick('submit');
      $("#imagemodal").modal("hide");
    }
  }

  handleAttendanceSaveBtnClick(event: any) {

    let payload: any = {}
    if (event === 'submit')
      payload.action = 'submit';
    else payload.action = 'save';

    payload.eventId = this.selectedEvent.eventid;
    payload.category = this.selectedCategory;
    payload.present = this.getParicipantAttendaneArr();

    //logic to create unselected users array 
    let tempArr = this.getUnselectedParicipantIdsArr();
    payload.absent = [];
    tempArr.forEach((item: number) => {
      if (payload.present.indexOf(item) < 0)
        payload.absent.push(item);
    });

    this.apiService.callPostService('postAttendance', payload).subscribe((response) => {
      if (response.data.status == 'failed') {
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      } else {
        this.uiCommonUtils.showSnackBar('Score recorded successfully!', 'success', 3000);
        this.getParicipantData(this.selectedEvent.eventid, this.selectedCategory);
      }
    })
  }

  // onDropdowwnSelChange(event: any) {
  //   this.getParicipantData(this.selectedEvent.eventid, this.selectedCategory);

  // }

  getParicipantData(eventId: any, category: any) {

    let urlString = `to=attendance&event=${eventId}&category=${category}`;

    this.apiService.callGetService('getParticipants?' + urlString).subscribe((respData) => {
      if (respData.data.status == 'failed') {
        this.attendanceRowData = [];
        this.uiCommonUtils.showSnackBar('Something  went wrong!', 'error', 3000);
        return;
      } else {
        //  this.attendanceRowData = respData.data.paticipants
        this.gridApi.setRowData(respData.data.paticipants);
        this.gridApi.forEachNode(
          (node: any) => {
            if (node.data.isSelected !== null)
              node.setSelected(node.data.hasAttended)
          });
        if (this.attendanceRowData == null) {
          this.uiCommonUtils.showSnackBar('No one participated in this category!', 'error', 3000);
          this.disableSaveSubmitBtn = true;
        } else {
          if (respData.data.paticipants[0].isAttendanceSubmitted)
            this.disableSaveSubmitBtn = true;
          else
            this.disableSaveSubmitBtn = false;
        }
      }
    });

  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }


  getParicipantAttendaneArr(): any[] {

    let selectedEvePartIds: any = [];

    for (let part of this.gridApi.getSelectedNodes())
      if (part.data.eventPartRegId)
        selectedEvePartIds.push(part.data.eventPartRegId);

    return selectedEvePartIds;
  }

  getUnselectedParicipantIdsArr(): any[] {

    let unselectedEvePartIds: any = [];
    this.gridApi.forEachNode(
      (node: any) => {
        if (node.data.eventPartRegId)
          unselectedEvePartIds.push(node.data.eventPartRegId)
      });

    return unselectedEvePartIds;
  }
}
