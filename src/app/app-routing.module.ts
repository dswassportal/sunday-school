import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignUpComponent } from 'src/app/screens/sign-up/sign-up.component'
import { SignInComponent } from './screens/sign-in/sign-in.component';
import { HomePageComponent } from './screens/home-page/home-page.component';
import { LandingPageComponent } from './screens/landing-page/landing-page.component';
import { UserProfileComponent } from './screens/user-profile/user-profile.component';
import { OvbsRegistrationComponent } from './screens/ovbs-registration/ovbs-registration.component';
import { AppComponent } from './app.component';
import { EventsComponent } from './screens/events/events.component';
import { EventCreationComponent } from './screens/event-creation/event-creation.component';
import { MyProfileComponent } from './screens/my-profile/my-profile.component';
import { DirtycheckGuard } from './dirtycheck.guard';
import { ApprovalRequestsComponent } from './screens/approval-requests/approval-requests.component';
import { LoginAccListComponent } from './screens/login-acc-list/login-acc-list.component';
import { CwcregistrationComponent } from './screens/cwcregistration/cwcregistration.component';
import { EventRegistrationComponent } from './screens/event-registration/event-registration.component';
import { ScoreComponent } from './screens/score/score.component';
import { ScoreReviewComponent } from './screens/score-review/score-review.component';
import { EventAttendanceComponent } from './screens/event-attendance/event-attendance.component'
import { StaffAssignmentComponent } from './screens/staff-assignment/staff-assignment.component';
import { EventBulkRegistrationComponent } from './screens/event-bulk-registration/event-bulk-registration.component';
import { BulkRegistrationComponent } from './screens/bulk-registration/bulk-registration.component';
import { SchoolAttendanceComponent } from './screens/school-attendance/school-attendance.component';
import { SundaySchoolAttendanceComponent } from './screens/sunday-school-attendance/sunday-school-attendance.component';
import { SearchComponent } from './screens/search/search.component';
import { ProfileSearchComponent } from './screens/profile-search/profile-search.component';
import { ParishSearchComponent } from './screens/parish-search/parish-search.component';
import { TeacherSearchComponent } from './screens/teacher-search/teacher-search.component';
import { EventExamRegistrationComponent } from './screens/event-exam-registration/event-exam-registration.component';
import { ExamRegistrationComponent } from './screens/exam-registration/exam-registration.component';


const routes: Routes = [
  { path: 'signup', component: SignUpComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'loginAccList', component: LoginAccListComponent },
  { path: '', component: HomePageComponent },
  { path: 'landingpage', component: LandingPageComponent },
  {
    path: 'dashboard', component: UserProfileComponent,
    children: [
      { path: 'ovbsregistration', component: OvbsRegistrationComponent },
      { path: 'users', component: LandingPageComponent },
      { path: 'events', component: EventsComponent },
      { path: 'requests', component: ApprovalRequestsComponent },
      { path: 'myprofile', component: MyProfileComponent, canDeactivate: [DirtycheckGuard] },
      { path: 'createevent', component: EventCreationComponent },
      { path: 'cwcregistration/:selectedEventType', component: CwcregistrationComponent },
      { path: 'eventRegistration', component: EventRegistrationComponent },
      { path: 'score', component: ScoreComponent },
      { path: 'scoreReview', component: ScoreReviewComponent },
      { path: 'attendance', component: EventAttendanceComponent },
      { path: 'staffAssignment', component: StaffAssignmentComponent },
      { path: 'eventBulkRegistration', component: EventBulkRegistrationComponent },
      { path: 'bulkRegistration', component: BulkRegistrationComponent },
      { path: 'schoolAttendance', component: SchoolAttendanceComponent },
      { path: 'sundaySchoolAttendance', component: SundaySchoolAttendanceComponent },
      { path: 'search', component: SearchComponent },
      { path: 'profileSearch', component: ProfileSearchComponent },
      { path: 'parishSearch', component: ParishSearchComponent },
      { path: 'teacherSearch', component: TeacherSearchComponent },
      { path: 'eventExamRegistration', component: EventExamRegistrationComponent },
      { path: 'examRegistration', component: ExamRegistrationComponent }
      // { path: 'testEvent',component:UserProfileComponent},
    ]
  },
  //{ path: 'landingpage/ovbsregistration', component:OvbsRegistrationComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [OvbsRegistrationComponent, UserProfileComponent]
