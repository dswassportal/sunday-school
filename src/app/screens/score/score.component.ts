import { Component, OnInit } from '@angular/core';
import { uiCommonUtils } from '../../common/uiCommonUtils'
import { ApiService } from '../../services/api.service'
import { ScoreUploadComponent } from '../renderers/score-upload/score-upload.component'
import * as XLSX from 'xlsx';

declare let $: any;


@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css']
})
export class ScoreComponent implements OnInit {

  constructor(private apiService: ApiService, private uiCommonUtils: uiCommonUtils) { }


  data: any;
  params: any;
  eventColumnDefs: any;
  eventRowData: any;
  term: any;
  eventGridOption: any;
  isTemplateUpload: boolean = false;

  participantRowData: any;
  participantColumnDefs: any;
  participantGridOptions: any;
  userId = this.uiCommonUtils.getUserMetaDataJson().userId;


  ngOnInit(): void {

    this.eventGridOption = {
      columnDefs: this.eventColumnDefs,
      rowData: this.eventRowData,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };

    this.participantGridOptions = {
      columnDefs: this.participantColumnDefs,
      rowData: this.participantRowData,
      treeData: true,
      enableFilter: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    }

    this.eventColumnDefs = [
      { headerName: 'Event Name', field: 'name', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Event Type', field: 'event_type', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Event Type', field: 'startDate', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Event Type', field: 'endDate', suppressSizeToFit: true, flex: 1, resizable: true, sortable: true, filter: true, },
      { headerName: 'Upload Score', field: 'action', suppressSizeToFit: true, flex: 1, resizable: true, cellRendererFramework: ScoreUploadComponent }
    ];

    this.participantColumnDefs = this.getParticipantDefArr(false)



    this.apiService.callGetService(`getEventData?user=${this.userId}&&eventType=for_judgement`).subscribe((respData) => {

      if (respData.data.status == 'failed') {
        this.eventRowData = [];
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      }

      if (respData.data.metaData) {
        this.eventRowData = respData.data.metaData.eventData
      } else
        this.eventRowData = [];

    });

  }

  selectedEventId: any;
  selectedEventName: any;
  selectedEvtIsScrSubmted: boolean = false;
  onRowClicked(event: any) {

    this.participantRowData = [];
    $("#imagemodal").modal("show");
    this.selectedEventId = event.data.event_Id;
    this.selectedEventName = event.data.name;
    this.apiService.callGetService(`getParticipants?event=${event.data.event_Id}&to=upload`).subscribe((respData) => {

      if (respData.data.status === 'failed') {
        this.participantRowData = [];
        this.selectedEvtIsScrSubmted = true;
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      } else {
        this.participantRowData = respData.data.paticipants
        this.selectedEvtIsScrSubmted = this.participantRowData[0].isScoreSubmitted;
        if (this.selectedEvtIsScrSubmted === true)
          this.participantColumnDefs = this.getParticipantDefArr(false);
        else
          this.participantColumnDefs = this.getParticipantDefArr(true);
      }
    });
  }


  // clickMethod(name: string) {
  //   if(confirm("Are you sure to delete "+name)) {
  //     console.log("Implement delete functionality here");
  //   }
  // }

  getParticipantDefArr(isEditable: boolean) {

    return ([
      { headerName: 'Registration Id', field: 'enrollmentId', flex: 1, suppressSizeToFit: true, resizable: true, sortable: true, filter: true },
      { headerName: 'Category', field: 'category', suppressSizeToFit: true, flex: 1, sortable: true, resizable: true, filter: true, },
      {
        headerName: 'Score', field: 'score', suppressSizeToFit: true, flex: 1, editable: isEditable, resizable: true,

        valueGetter: function (params: any) {
          return params.data.score;
        },
        valueSetter: function (params: any) {

          try {
            let score = parseInt(params.newValue);
            if (score > 0 && score != NaN)
              params.data.score = score;
            return true;
          } catch (error) {
            // alert('Please enter valid score.')
            return false;
          };
        },

      }
    ]);
  }

  handleScoreCompleteBtnClick($event: any) {

    let scoreData: any = this.getuserScoreArray();
    if (scoreData.length == 0) {
      this.uiCommonUtils.showSnackBar('Nothing to save!', 'error', 3000)
      return;
    } {
      let confmMsgSt = `Scores cannot be updated after submission, Please click \'Ok\' to proceed.`;
      if (confirm(confmMsgSt)) {
        this.handleScoreSaveBtnClick('submit');
        this.ngOnInit();
      }
    }
  }

  handleScoreSaveBtnClick(event: any) {

    let scoreData: any = this.getuserScoreArray();
    if (scoreData.length == 0) {
      this.uiCommonUtils.showSnackBar('Nothing to save!', 'error', 3000)
      return;
    } else {
      let payload: any = {};
      let scoreArr: any = []
      let temp:any = {
        judge: this.userId,
        eventId: this.selectedEventId,
        scoreData: scoreData,
    } 
    if (event == 'submit') {
      temp.action = 'submit';
    }
    else
    temp.action = 'save';
    scoreArr.push(temp)
    payload.scoreArr = scoreArr; 

      // payload.judge = this.userId;
      // payload.eventId = this.selectedEventId

      // payload.isTemplateUpload = this.isTemplateUpload;

      this.apiService.callPostService('postScore', payload).subscribe((response) => {

        if (response.data.status == 'failed') {
          this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000)
          return;
        } else {
          this.uiCommonUtils.showSnackBar('Score recorded successfully!', 'success', 3000)
        }
      })

    }
    $("#imagemodal").modal("hide");
    this.ngOnInit();
  }

  gridApi: any;
  onBtExport() {
    // this.gridApi.exportDataAsExcel();
    const params = {
      columnGroups: true,
      allColumns: true,
      fileName: `${this.selectedEventName.replaceAll(' ', '_')}-${this.uiCommonUtils.getUserMetaDataJson().firstName}`,
    };
    this.gridApi.exportDataAsCsv(params);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  getuserScoreArray(): any[] {

    let scoreData: any = [];

    // if (this.isTemplateUpload)
    this.gridApi.forEachNode((node: any) =>
      scoreData.push({
        'enrollmentid': node.data.enrollmentId,
        'category': node.data.category,
        'score': node.data.score
      }));
    // else
    //   this.participantRowData.forEach((item: any) => {
    //     if (item.score) {
    //       scoreData.push({
    //         scoreRefId: item.scoreRefId,
    //         partEveRegCatId: item.partEveRegCatId,
    //         score: item.score,
    //         catStaffMapId: item.catStaffMapId
    //       })
    //     }
    //   });
    return scoreData;
  }

  handleUploadScore(input: any) {
    this.isTemplateUpload = true;
    const files = input.target.files;
    var self = this;
    if (files && files.length) {
      const fileToRead = files[0];
      const fileReader = new FileReader();
      fileReader.onload = ((fileLoadedEvent: any) => {

        let fileData = fileLoadedEvent.target.result;
        let data = new Uint8Array(fileData);
        let arr = new Array();
        for (var i = 0; i !== data.length; ++i) {
          arr[i] = String.fromCharCode(data[i]);
        }
        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, { type: "binary" });

        // our data is in the first sheet
        var firstSheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[firstSheetName];

        var rowData = [];

        try {
          // start at the 2nd row - the first row are the headers
          let rowIndex = 2;
          while (worksheet['A' + rowIndex]) {
            rowData.push({
              'enrollmentId': worksheet['A' + rowIndex].v,
              'category': worksheet['B' + rowIndex].v,
              'score': worksheet['C' + rowIndex].v
            })
            rowIndex++;
          }
          // finally, set the imported rowData into the grid
          self.setGridDataFromExcel(rowData)
        } catch (error) {
          self.uiCommonUtils.showSnackBar('Error while processing uploaded file.', 'error', 4000);
        }


      });
      fileReader.readAsArrayBuffer(fileToRead);
      fileReader.onerror = () => {
        this.uiCommonUtils.showSnackBar('Error while processing uploaded file.', 'error', 4000);
      }
    }
  }

  setGridDataFromExcel(rowData: any) {
    this.gridApi.setRowData(rowData);
    this.gridApi.refreshCells(this.params)
  }

}

