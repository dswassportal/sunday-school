import { Component, OnInit } from '@angular/core';
import { uiCommonUtils } from '../../common/uiCommonUtils'
import { ApiService } from '../../services/api.service'
declare let $: any;

@Component({
  selector: 'app-score-review',
  templateUrl: './score-review.component.html',
  styleUrls: ['./score-review.component.css']
})
export class ScoreReviewComponent implements OnInit {

  constructor(private apiService: ApiService, private uiCommonUtils: uiCommonUtils) { }


  data: any;
  params: any;
  eventColumnDefs: any;
  eventRowData: any;
  term: any;
  eventGridOption: any;

  scoreApprovalColDef: any;
  scoreApprovalRowData: any;
  scoreApprovalGridOption: any;

  ngOnInit(): void {

    this.eventGridOption = {
      columnDefs: this.eventColumnDefs,
      rowData: this.eventRowData,
      treeData: true,
      enableFilter: true,
      singleClickEdit: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };


    this.scoreApprovalGridOption = {
      columnDefs: this.scoreApprovalColDef,
      rowData: this.scoreApprovalRowData,
      treeData: true,
      enableFilter: true,
      singleClickEdit: true,
      enableColResize: true,
      defaultColDef: {
        editable: false,
        filter: 'agTextColumnFilter'
      }
    };


    // this.eventGridOption.autoSizeColumns(['Event Name', 'Event Type'])
    this.eventColumnDefs = [
      { headerName: 'Event Name', field: 'name', resizable: true, flex: 1, suppressSizeToFit: true, sortable: true, filter: true },
      { headerName: 'Event Type', field: 'event_type', flex: 1, resizable: true, suppressSizeToFit: true, sortable: true, filter: true },
    ];

    this.scoreApprovalColDef = this.getParticipantDefArr(false);

    let userId = this.uiCommonUtils.getUserMetaDataJson().userId;

    this.apiService.callGetService(`getEventData?user=${userId}&eventType=review_pending`).subscribe((respData: any) => {

      if (respData.data.status == 'failed') {
        this.eventRowData = [];
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      }

      if (respData.data.metaData.eventData) {
        this.eventRowData = respData.data.metaData.eventData
      } else
        this.eventRowData = [];

    });

    // cellEditorParams: {
    //   values: ['Porsche', 'Toyota', 'Ford', 'AAA', 'BBB', 'CCC'],
    // },

  }

  selectedCat: string = '';
  selectedJudge: string = '';
  catNameArr: any = [];
  judgeNameArr: any = [];
  selectedEventData: any = {}
  masterData: any;
  disableApproveBtn: boolean = false;


  onFilteringRadioButtonChange(event: any) {

    let userId = this.uiCommonUtils.getUserMetaDataJson().userId;
    this.apiService.callGetService(`getEventData?user=${userId}&eventType=${event.value}`).subscribe((respData: any) => {

      if (respData.data.status == 'failed') {
        this.eventRowData = [];
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      }

      if (respData.data.metaData.eventData) {
        this.eventRowData = respData.data.metaData.eventData
      } else
        this.eventRowData = [];

    });
  }


  onRowClicked(event: any) {

    this.scoreApprovalRowData = [];
    this.catNameArr = [];
    this.judgeNameArr = [];
    this.selectedEventData = event.data;
    this.disableApproveBtn = true;
    $("#imagemodal").modal("show");


    this.apiService.callGetService(`getEventCatsAndStaffById?id=${event.data.event_Id}`).subscribe((respData) => {


      if (respData.data.status == 'failed') {
        this.scoreApprovalRowData = [];
        this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
        return;
      } else {

        if (respData.data.eventData.catarr !== null && respData.data.eventData.catarr !== null) {
          this.catNameArr = respData.data.eventData.catarr;
          this.judgeNameArr = respData.data.eventData.judgearr;
          this.selectedCat = this.catNameArr[0].categoryId;
          // this.selectedJudge = this.judgeNameArr[0].judgeId;

          // let urlString = `to=approve&event=${event.data.event_Id}&judge=${this.selectedJudge}&category=${this.selectedCat}`
          let urlString = `getScoreByCategory?eventId=${event.data.event_Id}&catId=${this.selectedCat}`

          this.apiService.callGetService(urlString).subscribe((respData) => {
            if (respData.data.status == 'failed') {
              this.scoreApprovalRowData = [];
              this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
              return;
            } else {
              this.scoreApprovalRowData = respData.data.scoreData
              if (this.scoreApprovalRowData !== null && this.scoreApprovalRowData[0].isScoreApproved === true) {
                this.disableApproveBtn = true;
                this.scoreApprovalColDef = this.getParticipantDefArr(false);
              }
              else {
                this.disableApproveBtn = false;
                this.scoreApprovalColDef = this.getParticipantDefArr(true);
              }
              if (respData.data.isApproved == true) {
                this.disableApproveBtn = true;
              }
            }
          });

        }
      }

    });
  }

  onDropdowwnSelChange(event: any) {

    // let urlString = `to=approve&event=${this.selectedEventData.event_Id}&judge=${this.selectedJudge}&category=${this.selectedCat}`
    let urlString = `getScoreByCategory?eventId=${this.selectedEventData.event_Id}&catId=${this.selectedCat}`
    this.apiService.callGetService(urlString).subscribe((respData) => {
      if (respData.data.status == 'failed') {
        this.scoreApprovalRowData = [];
        this.uiCommonUtils.showSnackBar('Something  went wrong!', 'error', 3000);
        return;
      } else {
        this.scoreApprovalRowData = respData.data.scoreData
        if (this.scoreApprovalRowData !== null && this.scoreApprovalRowData[0].isScoreApproved === true) {
          this.disableApproveBtn = true;
          this.scoreApprovalColDef = this.getParticipantDefArr(false);
        }
        else {
          this.disableApproveBtn = false;
          this.scoreApprovalColDef = this.getParticipantDefArr(true);
        }
      }
      if (respData.data.isApproved == true) {
        this.disableApproveBtn = true;
      }
    });
  }

  handleScoreApproveBtnClick() {

    let confmMsgSt = `Scores cannot be updated after approval, Please click \'Ok\' to proceed.`;
    let payload = {};
    let scoreArr: any = [];
    if (confirm(confmMsgSt)) {
      this.handleSaveApproveBtnClick();

      if (this.scoreApprovalRowData === null || this.scoreApprovalRowData.length === 0) {
        this.uiCommonUtils.showSnackBar('Nothing to Approve!', 'error', 3000)
        return;
      } else {

        let scoreData = this.getParticipantScoreArray();
        console.log("scoreData", scoreData);



        if (scoreData.length == 0) {
          this.uiCommonUtils.showSnackBar('Nothing to save!', 'error', 3000)
          return;
        } else {


          scoreData.forEach(element => {
            scoreArr.push(element)
          });
          //payload.scoreArr = scoreArr;
        }

        payload = {
          action: 'approve',
          eventId: this.selectedEventData.event_Id,
          judgeId: this.selectedJudge,
          catId: this.selectedCat,
          catMapId: this.scoreApprovalRowData[0].catMapId,
          scoreArr: scoreArr

        };

        this.apiService.callPostService('postScore', payload).subscribe((response) => {

          if (response.data.status == 'failed') {
            this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000)
            return;
          } else {
            this.uiCommonUtils.showSnackBar('Score successfully approved!', 'success', 3000)
          }
          //$("#imagemodal").modal("hide");
        })
        this.onDropdowwnSelChange('');
      }
    }
  }

  handleSaveApproveBtnClick() {

    let scoreData = this.getParticipantScoreArray();
    if (scoreData.length == 0) {
      this.uiCommonUtils.showSnackBar('Nothing to save!', 'error', 3000)
      return;
    } else {
      let payload: any = {};

      payload.action = 'review_save';
      let scoreArr: any = []
      scoreData.forEach(element => {
        scoreArr.push(element)
      });
      payload.scoreArr = scoreArr;

      this.apiService.callPostService('postScore', payload).subscribe((response) => {

        if (response.data.status == 'failed') {
          this.uiCommonUtils.showSnackBar('Please fill marks of all the students!', 'error', 3000)
          return;
        } else {
          this.uiCommonUtils.showSnackBar('Score recorded successfully!', 'success', 3000)
        }
      })
      this.onDropdowwnSelChange('');
    }
    $("#imagemodal").modal("hide");
    //this.onDropdowwnSelChange('');
  }

  getParticipantDefArr(isEditable: boolean) {

    let colArr: any = [
      { headerName: 'Enrollment ID', field: 'enrollmentId', resizable: true, width: 150, sortable: true, filter: true },
      { headerName: 'Name', field: 'participantName', flex: 1, resizable: true, suppressSizeToFit: true, sortable: true, filter: true },
      { headerName: 'Parish', field: 'org', flex: 1, resizable: true, suppressSizeToFit: true, sortable: true, filter: true }
    ]
    let tempElement: any = {};
    var keys: string[] = [];
    let isJudgePushed: any[] = [];


    if (this.scoreApprovalRowData) {
      for (let row of this.scoreApprovalRowData) {
        tempElement = row;
        keys = Object.keys(tempElement);

        for (let judge of this.judgeNameArr) {

          if (keys.indexOf(judge.judgeId + "") >= 0) {

            if (isJudgePushed.length == 0) {
              isJudgePushed.push(judge.judgeId);

              if (isJudgePushed.indexOf(judge.judgeId) >= 0) {
                let column = {
                  headerName: judge.judgeName, field: `${judge.judgeId}`, flex: 1, editable: isEditable, suppressSizeToFit: true, resizable: true,
                  valueGetter: function (params: any) {
                    return params.data[judge.judgeId];
                  },
                  valueSetter: function (params: any) {

                    try {
                      let score = parseInt(params.newValue);
                      if (score > 0 && score != NaN)
                        params.data[judge.judgeId] = score;
                      return true;
                    } catch (error) {
                      return false;
                    };
                  },
                }
                colArr.push(column);

              }
            }
            if (isJudgePushed.indexOf(judge.judgeId) == -1) {
              isJudgePushed.push(judge.judgeId);

              if (isJudgePushed.indexOf(judge.judgeId) >= 0) {
                let column = {
                  headerName: judge.judgeName, field: `${judge.judgeId}`, flex: 1, editable: isEditable, suppressSizeToFit: true, resizable: true,
                  valueGetter: function (params: any) {
                    return params.data[judge.judgeId];
                  },
                  valueSetter: function (params: any) {

                    try {
                      let score = parseInt(params.newValue);
                      if (score > 0 && score != NaN)
                        params.data[judge.judgeId] = score;
                      return true;
                    } catch (error) {
                      return false;
                    };
                  },
                }
                colArr.push(column);

              }
            }



          }

        }
      }


    }

    isJudgePushed = [];

    colArr.push(
      {
        headerName: 'Average Score',
        aggFunc: 'sum',
        flex: 1, resizable: true, suppressSizeToFit: true, sortable: true, filter: true,
        valueGetter: this.AvgValueGetter,
        valueSetter: function (params: any) {
          params.data.avgScore = params.newValue;
          return true;
        }
      })

    return colArr;
  }

  AvgValueGetter = (params: any): Number => {

    let sum = 0
    let jCount = 0;
    let avgScore = 0;
    let tempElement = {};
    if (this.scoreApprovalRowData)
      tempElement = this.scoreApprovalRowData[0];
    var keys = Object.keys(tempElement);
    for (let judge of this.judgeNameArr) {
      if (keys.indexOf(judge.judgeId + "") >= 0) {
        sum += params.data[judge.judgeId]
        jCount++;
      }
    }
    avgScore = Math.round((sum / jCount))
    params.data.avgScore = avgScore;
    return avgScore;

  };

  getParticipantScoreArray(): any[] {

    let scoreData: any = [];
    let consolidatedArr: any = [];
    let judges: any = [];

    let catIndex = this.catNameArr.findIndex((catItem: any) => catItem.categoryId == this.selectedCat)

    this.judgeNameArr.forEach((element: any) => {
      judges.push(element.judgeId + '')
    });

    this.scoreApprovalRowData.forEach((item: any) => {

      Object.keys(item).forEach(element => {
        if (judges.indexOf(element) >= 0) {
          scoreData.push({
            enrollmentid: item.enrollmentId,
            score: item[element],
            judge: element,
            category: this.catNameArr[catIndex].categoryName
          })
        }
      });
    });

    for (let judge of judges) {
      let temp: any = {};
      temp.scoreData = scoreData.filter((item: any) => item.judge == judge);
      temp.judge = parseInt(judge);
      temp.eventId = this.selectedEventData.event_Id;
      consolidatedArr.push(temp);
    }

    return consolidatedArr;
  }

}