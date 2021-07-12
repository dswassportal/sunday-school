import { BrowserModule } from '@angular/platform-browser';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonRendererComponent } from './screens/renderers/button-renderer/button-renderer.component';
import { AppRoutingModule,routingComponents } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { SignUpComponent } from './screens/sign-up/sign-up.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignInComponent } from './screens/sign-in/sign-in.component';
import {MatIconModule} from '@angular/material/icon';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {Ng2TelInputModule} from 'ng2-tel-input';
import { NgxFlagPickerModule } from 'ngx-flag-picker';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import { FooterComponent } from './screens/footer/footer.component';
import { NavigationComponent } from './screens/navigation/navigation.component';
import { HomePageComponent } from './screens/home-page/home-page.component';
import { LandingPageComponent } from './screens/landing-page/landing-page.component';
import { FlexLayoutModule } from '@angular/flex-layout';
//import { UserProfileComponent } from './screens/user-profile/user-profile.component';

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment.prod';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import {MatRadioModule} from '@angular/material/radio';

// Auth service
import { AuthService } from "./services/auth.service";
import { AgGridModule } from "ag-grid-angular";
import { MatButtonModule} from '@angular/material/button';
import { NavbarModule, WavesModule, ButtonsModule } from 'ng-uikit-pro-standard';
//import { OvbsRegistrationComponent } from './screens/ovbs-registration/ovbs-registration.component';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';

import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { EventsComponent } from './screens/events/events.component';
import { EventCreationComponent } from './screens/event-creation/event-creation.component';

import {MatAccordion} from '@angular/material/expansion';
import { MatMenuItem } from '@angular/material/menu';
import {MatExpansionModule} from '@angular/material/expansion';
import { MyProfileComponent } from './screens/my-profile/my-profile.component';
import { LoaderInterceptor } from './app.LoaderInterceptor';
import { NgxSpinnerModule } from "ngx-spinner";
import {customSnackBar} from './common/uiCommonUtils'
import { ReqRendererComponent } from './screens/renderers/req-renderer/req-renderer.component';
import { ApprovalRequestsComponent } from './screens/approval-requests/approval-requests.component';
import {MatStepperModule} from '@angular/material/stepper';
import {EventDataService } from './screens/events/event.dataService';
import { LoginAccListComponent } from './screens/login-acc-list/login-acc-list.component';
import { CwcregistrationComponent } from './screens/cwcregistration/cwcregistration.component';
import { EventRegistrationComponent } from './screens/event-registration/event-registration.component'
//import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ScoreComponent } from './screens/score/score.component';
import { ScoreUploadComponent } from './screens/renderers/score-upload/score-upload.component';
import { ScoreUploadInputComponent } from './screens/renderers/score-upload-input/score-upload-input.component';
import { ScoreReviewComponent } from './screens/score-review/score-review.component';
import { EventAttendanceComponent } from './screens/event-attendance/event-attendance.component';
import { CheckboxRendererComponent } from './screens/renderers/checkbox-renderer/checkbox-renderer.component';
import { DatePickerRendererComponent } from './screens/renderers/date-picker-renderer/date-picker-renderer.component';
import { StaffAssignmentComponent } from './screens/staff-assignment/staff-assignment.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';
import { EventBulkRegistrationComponent } from './screens/event-bulk-registration/event-bulk-registration.component';
import { BulkRegistrationComponent } from './screens/bulk-registration/bulk-registration.component';
import { SchoolAttendanceComponent } from './screens/school-attendance/school-attendance.component';
import { SundaySchoolAttendanceComponent } from './screens/sunday-school-attendance/sunday-school-attendance.component';
import { SearchComponent } from './screens/search/search.component';
import { ProfileSearchComponent } from './screens/profile-search/profile-search.component';
import { ParishSearchComponent } from './screens/parish-search/parish-search.component';
import { TeacherSearchComponent } from './screens/teacher-search/teacher-search.component';


@NgModule({
  declarations: [
    AppComponent,
	SignUpComponent,
    SignInComponent,
    FooterComponent,
    NavigationComponent,
    HomePageComponent,
    LandingPageComponent,
    routingComponents,
    EventsComponent,
    EventCreationComponent,
    ButtonRendererComponent,
    MyProfileComponent,
    ApprovalRequestsComponent,
    ReqRendererComponent,  
    customSnackBar, 
    LoginAccListComponent, 
    CwcregistrationComponent, 
    EventRegistrationComponent,
     ScoreComponent, 
     ScoreUploadComponent,
      ScoreUploadInputComponent, 
      ScoreReviewComponent, 
      EventAttendanceComponent,
       DatePickerRendererComponent,
        StaffAssignmentComponent,
        EventBulkRegistrationComponent,
        BulkRegistrationComponent,
        SchoolAttendanceComponent,
        SundaySchoolAttendanceComponent,
        SearchComponent,
        ProfileSearchComponent,
        ParishSearchComponent,
        TeacherSearchComponent
    //UserProfileComponent,
    //OvbsRegistrationComponent
  ],
  imports: [

    //imports for firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,

    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatMenuModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    Ng2TelInputModule,
    NgxFlagPickerModule ,
    FlexLayoutModule,
    MatSnackBarModule,
    HttpClientModule,   
    MatButtonModule,
    NavbarModule, 
    WavesModule, 
    ButtonsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    Ng2SearchPipeModule,
    MatRadioModule,
    //MatAccordion,
    //MatMenuItem,
    MatExpansionModule,
    AgGridModule.withComponents([ButtonRendererComponent]),
    NgxSpinnerModule,
    MatStepperModule,
    NgxDaterangepickerMd.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NgxMatIntlTelInputModule
  ],
  providers: [AuthService,  { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },EventDataService, {provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent],
  entryComponents: [CheckboxRendererComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
