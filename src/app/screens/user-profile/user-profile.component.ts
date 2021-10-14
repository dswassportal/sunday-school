import { Component, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { Router } from "@angular/router";
import { uiCommonUtils } from "../../common/uiCommonUtils"

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor( public router: Router, private uiCommonUtils:uiCommonUtils) { }

  ngOnInit(): void {

    let userMetaData = this.uiCommonUtils.getUserMetaDataJson()

    if (userMetaData.isApproved == false) {
      this.uiCommonUtils.showSnackBar("Your account has not been approved yet!", 'error', 4000)
    }

    let flyUrl: any;
    flyUrl = localStorage.getItem('flyerUrl');
    console.log("flyUrl", flyUrl);
    if (flyUrl == "") {
      console.log("111");
      localStorage.setItem('flyerEventId', '');
      //this.router.navigate(['/dashboard']);
    }
    else {
      console.log("222");
      console.log("flyUrl 222", flyUrl);
      let splittedEventId = flyUrl.split(" ");
      let eventId!: string;
      eventId = splittedEventId[1]; 
      let eventType = "upcoming_events";
      this.router.navigate(['/dashboard/cwcregistration/', eventType]);
      console.log("eventId 222", eventId);
      localStorage.setItem('flyerEventId', eventId);
    }
    localStorage.setItem('flyerUrl', '');
    console.log("In userMetaData", userMetaData);
  }


  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    //  alert('Back Button Pressed....')
    localStorage.setItem('chUserToken', '');
    localStorage.setItem('chUserFbId', '');
    localStorage.setItem('chUserMetaData', '');
    //this.router.navigate(['/']);

  }

}
