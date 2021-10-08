import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { uiCommonUtils } from '../common/uiCommonUtils'
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(private http: HttpClient, private uiCommonUtils: uiCommonUtils) {

    console.log('Application url set to : ' + environment.apiUrl);
    let urlMapping = window.location.href;
    let splittedUrl = urlMapping.split("=");
    let eventId = splittedUrl[1];
    let isValidUrl = urlMapping.includes("upcoming_events");
    if (isValidUrl == true) {
      console.log("urlMapping :", urlMapping);
      localStorage.setItem('flyerUrl', urlMapping + '' + 'eventId ' + eventId);
    }
    else {
      localStorage.setItem('flyerUrl', "");
    }


  }
  private _baseUrl = environment.apiUrl;

  signUpNewUser(userData: any): Observable<any> {
    console.log(`signUpNewUser called..`)
    // let headerObj = new HttpHeaders({
    //                                   'Authorization': localStorage.getItem('cormUserTokenId')!,
    //                                   'Content-Type' : 'application/json'
    //                                 });
    // console.log('headers set to ' + JSON.stringify(headerObj))
    return this.http.post(`${this._baseUrl}/signUp`, userData);
    // return this.http.post(`${this._baseUrl}/signUp`, searchString, { headers: headerObj });
  }


  callGetService(endPoint: string): Observable<any> {
    console.log(`callGetService called..`)
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json',
      'User': btoa(this.uiCommonUtils.getUserMetaDataJson().userId)
    });
    return this.http.get(`${this._baseUrl}/${endPoint}`, { headers: headerObj });
  }

  callPostService(endPoint: string, payload: any): Observable<any> {
    console.log(`postService called`)
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json',
      'User': btoa(this.uiCommonUtils.getUserMetaDataJson().userId)
    });

    return this.http.post(`${this._baseUrl}/${endPoint}`, { data: payload }, { headers: headerObj });
  }


  getUsersData(loggedInUserId: any): Observable<any> {
    console.log(`calling the usesData()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('cormUserTokenId')!,
      'Content-Type': 'application/json'
    });
    console.log('user data is : ' + this.http.get(`${this._baseUrl}/getuserRecords?loggedInUser=loggedInUserId`), loggedInUserId);
    return this.http.get(`${this._baseUrl}/getuserRecords?type=approved&loggedInUser=` + loggedInUserId);
  }

  getUnapprovedUserData(loggedInUserId: any, userType: string): Observable<any> {
    console.log(`calling the getUnapprovedUserData()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('cormUserTokenId')!,
      'Content-Type': 'application/json'
    });
    console.log('user data is : ' + this.http.get(`${this._baseUrl}/getuserRecords`), loggedInUserId);
    return this.http.get(`${this._baseUrl}/getuserRecords?type=${userType}&loggedInUser=` + loggedInUserId);

  }

  getUserRoleData(): Observable<any> {
    console.log(`calling the usersRoleData()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('user data is : ' + this.http.get(`${this._baseUrl}/getRoleMetaData`));
    return this.http.get(`${this._baseUrl}/getRoleMetaData`);
  }

  getParishListData(): Observable<any> {
    console.log(`calling the ParishListData()`);
    // let headerObj = new HttpHeaders({
    //                 'Authorization': localStorage.getItem('chUserToken')!,
    //                 'Content-Type' : 'application/json'
    //               });
    // console.log( 'user data is : ' + this.http.get(`${this._baseUrl}/getRoleMetaData`));
    return this.http.get(`${this._baseUrl}/getParishData`);
  }

  deleteUser(userData: any) {
    console.log("Delete User Profile Called..")
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('headers set to ' + JSON.stringify(headerObj))
    console.log(JSON.stringify(userData));
    return this.http.post(`${this._baseUrl}/deleteUsers`, JSON.stringify(userData), { headers: headerObj });
  }
  // updateUserProfile(userData: any) {
  //   console.log("update User Profile Called..")
  //   let headerObj = new HttpHeaders({
  //     'Authorization': localStorage.getItem('chUserToken')!,
  //     'Content-Type': 'application/json'
  //   });
  //   console.log('headers set to ' + JSON.stringify(headerObj))
  //   console.log(JSON.stringify(userData));
  //   return this.http.post(`${this._baseUrl}/updateUserRoles`, JSON.stringify(userData), { headers: headerObj });
  // }

  getEventCategoryData(): Observable<any> {
    console.log(`calling the getEventCategory()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('Event Category data is : ' + this.http.get(`${this._baseUrl}/getEventCategory`));
    return this.http.get(`${this._baseUrl}/getEventCategory`);
  }

  getEventsData(): Observable<any> {
    console.log(`calling the getEventData()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('Events Data data is : ' + this.http.get(`${this._baseUrl}/getEventData`));
    return this.http.get(`${this._baseUrl}/getEventData`);
  }

  // approveOrRejReq(reqData: any) {
  //   console.log("update User Profile Called..")
  //   let headerObj = new HttpHeaders({
  //     'Authorization': localStorage.getItem('chUserToken')!,
  //     'Content-Type': 'application/json'
  //   });
  //   console.log('headers set to ' + JSON.stringify(headerObj))
  //   console.log(JSON.stringify(reqData));
  //   return this.http.post(`${this._baseUrl}/setUserApprovalState`, JSON.stringify(reqData), { headers: headerObj });
  // }

  getCountryStates() {
    console.log(`calling the getCountryStates()`);

    return this.http.get(`${this._baseUrl}/getCountryStates`);
  }

  insertevents(eventsData: any) {
    console.log("insertevents api Called..")
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('headers set to ' + JSON.stringify(headerObj))
    console.log(JSON.stringify(eventsData));
    return this.http.post(`${this._baseUrl}/insertevents`, JSON.stringify(eventsData), { headers: headerObj });
  }

  getProctorData(userData: any): Observable<any> {
    console.log(`calling the getProctorData()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('getProctorData is : ' + this.http.get(`${this._baseUrl}/getProctorData`), userData);
    return this.http.post(`${this._baseUrl}/getProctorData`, userData);
  }

  getRegionAndParish() {
    console.log(`calling the getRegionAndParish()`);

    return this.http.get(`${this._baseUrl}/getRegionAndParish`);
  }

  getVenues(userData: any): Observable<any> {
    console.log(`calling the getVenues()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('getVenues is : ' + this.http.get(`${this._baseUrl}/getVenues`), userData);
    return this.http.post(`${this._baseUrl}/getVenues`, userData);
  }

  getEventType() {
    console.log(`calling the getEventType()`);

    return this.http.get(`${this._baseUrl}/getEventType`);
  }

  /** Get questionnire data from database */
  getEventQuestionnaireData(): Observable<any> {
    console.log(`calling the getEventQuestionnaireData()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('getEventQuestionnaireData Data data is : ' + this.http.get(`${this._baseUrl}/getEventQuestionnaireData`));
    return this.http.get(`${this._baseUrl}/getEventQuestionnaireData`);
  }

  /**.........get events data from v_events for registration for the user */
  getEventForRegistration(): Observable<any> {
    console.log(`calling the getEventDataForRegistrationData()`);
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('getEventForRegistration Data data is : ' + this.http.get(`${this._baseUrl}/getEventForRegistration`));
    return this.http.get(`${this._baseUrl}/getEventForRegistration`);
  }


  updateEvent(eventsData: any) {
    console.log("updateEvent api Called..")
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'application/json'
    });
    console.log('headers set to ' + JSON.stringify(headerObj))
    console.log(JSON.stringify(eventsData));
    return this.http.post(`${this._baseUrl}/updateEvent`, JSON.stringify(eventsData), { headers: headerObj });
  }


  uploadfiles(url: string, formData: any) {
    let headerObj = new HttpHeaders({
      'Authorization': localStorage.getItem('chUserToken')!,
      'Content-Type': 'multipart/form-data'
    });
    return this.http.post(`${this._baseUrl}/${url}`, formData);
  }

  downloadEventDoc(attachment: any): any {
    return this.http.get(`${this._baseUrl}/getEventDoc?docId=${attachment.attId}`)
      .pipe(map((data: any) => {
        return new Blob([new Uint8Array(data.data.fileData.data)], { type: data.data.mimeType });
      }))
  }
}
