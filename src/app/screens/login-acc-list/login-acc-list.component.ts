import { Component, OnInit } from '@angular/core';
import { Router } from '../../../../node_modules/@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { uiCommonUtils } from '../../common/uiCommonUtils'

@Component({
  selector: 'app-login-acc-list',
  templateUrl: './login-acc-list.component.html',
  styleUrls: ['./login-acc-list.component.css']
})
export class LoginAccListComponent implements OnInit {
  columnDefs: any;
  rowData: any;
  showgrid: boolean = false;

  constructor(private router: Router, private apiService: ApiService, private uiCommonUtils: uiCommonUtils) { }

  ngOnInit(): void {

    if (localStorage.getItem('chUserToken') == '' &&
      localStorage.getItem('chUserFbId') == '' &&
      localStorage.getItem('chUserMetaData') == '') {
      this.router.navigate(['/signin']);
    } else {
      this.apiService.callGetService(`getMembers?fbuid=${localStorage.getItem('chUserFbId')}`).subscribe((res) => {

        if (res.data.status == 'success') {
          if (res.data.memberCount > 0) {
            this.showgrid = true;
            this.rowData = res.data.members;
          } else {
            //localStorage.setItem('chloggedInUserId', res.data.userId)
            this.navigateToDashBoard(res.data.userId)
            //this.router.navigate(['/dashboard']);
          }
        } else {
          this.router.navigate(['/signin']);
          this.uiCommonUtils.showSnackBar(res.data.errorMessage, 'error', 4000);
        }
      })
    }


    this.columnDefs = [
      { headerName: 'Users', field: 'name', suppressSizeToFit: true, flex:1,resizable: true,sortable: true, filter: true },
    ];

    //   this.rowData = [
    //     { firstname: 'ABC', lastname: 'XYZ' ,role:'Family Head'},
    //     { firstname: 'PQR', lastname: 'XYZ' ,role:'Member'},
    //     { firstname: 'UVW', lastname: 'XYZ' ,role:'Member'},
    // ];

  }

  onRowClicked(event: any) {
    console.log(event);

    // localStorage.setItem('chloggedInUserId', event.data.userId)
    this.navigateToDashBoard(event.data.userId)

    //this.router.navigate(['/dashboard']);

    //getMetadata api call

  }

  navigateToDashBoard(userId: number) {
    this.apiService.callGetService(`getUserMetaData?uid=${userId}`).subscribe((data) => {
      if (data.data.status == 'failed') {
        this.router.navigate(['/signin']);
        this.uiCommonUtils.showSnackBar(data.data.errorMessage, 'error', 3000);
      } else {
        localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData))
        this.router.navigate(['/dashboard']);
      }
    })
  }

}
