import { Injectable, NgZone } from '@angular/core';
// import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { uiCommonUtils } from '../common/uiCommonUtils'
import { ApiService } from '../services/api.service'

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  signedInUser: any;

  static GoogleAuth() {
    throw new Error('Method not implemented.');
  }
  static signInWithGoogle() {
    throw new Error('Method not implemented.');
  }
  userData: any; // Save logged in user data

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone,
    private uiCommonUtils: uiCommonUtils,
    private apiService: ApiService
    // private cormantisCommonUtils: CormantisCommonUtils  // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
    // this.afAuth.authState.subscribe(user => {
    //   if (user) {
    //     this.userData = user;
    //     localStorage.setItem('user', JSON.stringify(this.userData));
    //     JSON.parse(localStorage.getItem('user'));
    //   } else {
    //     localStorage.setItem('user', null);
    //     JSON.parse(localStorage.getItem('user'));
    //   }
    // })
  }

  // Sign in with email/password for church project
  SignIn(data: any) {
    console.log(`Attempting to sign in with email: ${data.data.username} and password: ${data.data.password}`)
    this.afAuth.auth.signInWithEmailAndPassword(data.data.username, data.data.password)
      .then((result: any) => {
       // if (result.user?.emailVerified == false) {
          // this.uiCommonUtils.showSnackBar('Please verify your email.', 'error', 3000)
          // return;
        //} else {
          this.signedInUser = result.user;
          this.ngZone.run(() => {
            result.user?.getIdToken().then((token: string) => {
              localStorage.setItem('chUserToken', token)
            })
            this.apiService.callGetService(`getUserMetaData?fbuid=${result.user?.uid}`).subscribe((data) => {

              if (data.data.status == 'failed') {
                this.uiCommonUtils.showSnackBar(data.data.errorMessage, 'error', 3000);
              } else {
                localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData))
                this.router.navigate(['/dashboard']);
              }
            })
          });
       // }
        this.SetUserData(result.user);
      }).catch((error: any) => {
        this.uiCommonUtils.showSnackBar(error.message, 'Dismiss', 4000)
      })
  }


  //Method to register new church application user
  SignUp(formData: any) {
    return this.afAuth.auth.createUserWithEmailAndPassword(formData.email, formData.password)
      .then((result: any) => {
        formData.fbId = result.user?.uid
        formData.password = '';
        formData.cnfmpwd = '';
        this.apiService.signUpNewUser({ data: formData }).subscribe((data: any) => {
          if (data.data.status == 'success') {

            result.user?.updateProfile({
              displayName: formData.firstName + " " + formData.lastName,
            }).catch((error: any) => {
              console.log(`Error while updating the username as : ${error}`);
            }).then((res: any) => {
             // result.user?.sendEmailVerification();
            })
            this.router.navigate(['/signin']);
            this.uiCommonUtils.showSnackBar('Sign up complete, Please check your inbox to verify your email address', 'Dismiss', 5000);
          } else {
            this.uiCommonUtils.showSnackBar(`Something went wrong(${data.data.errorCode} : ${data.data.errorMessage})`, 'Dismiss', 5000);
          }
        });
        this.SetUserData(result.user);
        // this.router.navigate(['signin']);
      }).catch((error: any) => {
        this.uiCommonUtils.showSnackBar(error.message, 'Dismiss', 3000);
        // window.alert(error.message)
      })
  }

  // Reset Forggot password
  //   ForgotPassword(passwordResetEmail: string) {
  //     return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
  //       .then(() => {
  //        // window.alert('Password reset email sent, check your inbox.');
  //         this.cormantisCommonUtils.openSnackBar('Password reset email sent, check your inbox.','Close')
  //       }).catch((error) => {
  //         window.alert(error)
  //       })
  //   }

  // Returns true when user is looged in and email is verified
  // get isLoggedIn(): boolean {
  //   const user = JSON.parse(localStorage.getItem('user'));
  //   return (user !== null && user.emailVerified !== false) ? true : false;
  // }


  SetUserData(user: any) {
    // const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    // const userData: User = {
    //   uid: user.uid,
    //   email: user.email,
    //   displayName: user.displayName,
    //   photoURL: user.photoURL,
    //   emailVerified: user.emailVerified
    // }
    // return userRef.set(userData, {
    //   merge: true
    // })
  }

  getSignedInUserName() {
    let userName = this.signedInUser?.displayName;

    if (userName != undefined) {
      console.log('Setting cormUser to  : ' + userName)
      localStorage.setItem('cormUser', userName)
    }

    if (localStorage.getItem('cormUser') == undefined) {
      this.router.navigate(['signin'])
    } else
      userName = localStorage.getItem('cormUser')

    //   if (userName != '' || userName != undefined)
    //     this.router.navigate(['signin'])
    // }
    return userName;

  }

    // Reset Forggot password
    forgotPassword(passwordResetEmail: string) {
      return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
        .then(() => {
         // window.alert('Password reset email sent, check your inbox.');
          this.uiCommonUtils.showSnackBar('Password reset link has been sent to your email.','success',5000)
        }).catch((error) => {
          console.log('Error occured while resetting password as : ' + error); 
        })
    }

  // Sign out
  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    })
  }

}
