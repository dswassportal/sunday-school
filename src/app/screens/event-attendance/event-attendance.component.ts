import { Component, OnInit } from '@angular/core';
import { uiCommonUtils } from '../../common/uiCommonUtils'
import { ApiService } from '../../services/api.service'
import { CheckboxRendererComponent } from '../renderers/checkbox-renderer/checkbox-renderer.component'

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
      { headerName: 'Event Name', field: 'eventname', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Event Type', field: 'eventtype', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Start Date', field: 'startdate', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
      { headerName: 'End Date', field: 'enddate', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true },
    ];

    this.attendanceColDef = [
      { headerName: 'Enrollment Id', field: 'enrollmentId', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Category', field: 'eventCategoryName', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Mark Here', headerCheckboxSelection: true, checkboxSelection: true, },
    ];

    //cellRendererFramework: CheckboxRendererComponent, field: 'hasAttended', editable: false 
    let userId = this.uiCommonUtils.getUserMetaDataJson().userId
    this.apiService.callGetService(`getEventData?user=${userId}&eventType=attendance`).subscribe((respData) => {

      if (respData.data.status == 'failed') {
        this.eventRowData = []
        this.categoriesArr = []
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      }

      if (respData.data.metaData) {
        this.eventRowData = respData.data.metaData.events        
      } else
        this.eventRowData = [];

    });

  }

  selectedEvent: any = {};
  onRowClicked(event: any) {

    this.attendanceRowData = []
    this.selectedEvent = event.data;
    this.categoriesArr = event.data.catagories;
    this.selectedCategory = event.data.catagories[0].catId;
    $("#imagemodal").modal("show");

    this.getParicipantData(this.selectedEvent.eventid, this.selectedCategory)
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
    payload.attendance = this.getParicipantAttendaneArr();

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

  onDropdowwnSelChange(event: any) {
    this.getParicipantData(this.selectedEvent.eventid, this.selectedCategory);

  }

  getParicipantData(eventId: any, category: any) {

    let urlString = `to=attendance&event=${eventId}&category=${category}`;

    this.apiService.callGetService('getParticipants?' + urlString).subscribe((respData) => {
      if (respData.data.status == 'failed') {
        this.attendanceRowData = [];
        this.uiCommonUtils.showSnackBar('Something  went wrong!', 'error', 3000);
        return;
      } else {
        this.attendanceRowData = respData.data.paticipants
        if (this.attendanceRowData == null) {
          this.uiCommonUtils.showSnackBar('No one participated in this category!', 'error', 3000);
          this.disableSaveSubmitBtn = true;
        } else {
          if (this.attendanceRowData[0].isAttendanceSubmitted)
            this.disableSaveSubmitBtn = true;
          else
            this.disableSaveSubmitBtn = false;
        }
        this.gridApi.forEachNodeAfterFilter((node: any) => {
          node.setSelected(node.data.hasAttended, node.data.hasAttended);
          //node.selectThisNode(node.data.hasAttended)
          console.log('Setting up Node :' + node.data.enrollmentId  )
          });
      }
    });

  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }


  getParicipantAttendaneArr(): any[] {

    let participants = [];
    for (let part of this.attendanceRowData) {
      let temp: any = {};
      temp.participantId = part.participantId;
      temp.eventPartRegId = part.eventPartRegId;
      temp.hasAttended = part.hasAttended;
      participants.push(temp)
    }

    return participants;
  }
}
