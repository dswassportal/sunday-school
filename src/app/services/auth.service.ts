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
  // ______________________________________ Commented By Sudip ____________________________________________
  // Sign in with email/password for church project
  // SignIn(data: any) {
  //   console.log(`Attempting to sign in with email: ${data.data.username} and password: ${data.data.password}`)
  //   this.afAuth.auth.signInWithEmailAndPassword(data.data.username, data.data.password)
  //     .then((result: any) => {
  //       // if (result.user?.emailVerified == false) {
  //       // this.uiCommonUtils.showSnackBar('Please verify your email.', 'error', 3000)
  //       // return;
  //       //} else {
  //       this.signedInUser = result.user;
  //       this.ngZone.run(() => {
  //         result.user?.getIdToken().then((token: string) => {
  //           localStorage.setItem('chUserToken', token);
  //           localStorage.setItem('chUserFbId', result.user?.uid);

  //           this.apiService.callGetService(`getUserApprovalStatus?fbuid=${result.user?.uid}`).subscribe((data) => {

  //             if (data == null) {
  //               try {
  //                 // result.user?.delete();
  //                 //this.uiCommonUtils.showSnackBar('No such account exist!','error',3000)
  //                 return;
  //               } catch (error) {
  //                 console.log('Error while deleting User.');
  //               }
  //             }

  //             if (data.data.status == 'failed') {
  //               this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
  //             } else {
  //               this.userData = result.user;
  //               if (data.data.isapproved == false) {
  //                 this.apiService.callGetService(`getUserMetaData?uid=${data.data.user}`).subscribe((data) => {

  //                   if (data.data.status == 'failed') {
  //                     this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
  //                   } else {
  //                     localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData))
  //                     this.router.navigate(['/dashboard']);
  //                     //this.router.navigate(['/dashboard']);
  //                   }
  //                 })
  //               }
  //               else
  //                 this.router.navigate(['/loginAccList']);
  //             }
  //           })



  //         })
  //         // this.apiService.callGetService(`getUserMetaData?uid=${userId}`).subscribe((data) => {

  //         //   if (data.data.status == 'failed') {
  //         //     this.uiCommonUtils.showSnackBar(data.data.errorMessage, 'error', 3000);
  //         //   } else {
  //         //     localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData))
  //         //     //this.router.navigate(['/dashboard']);
  //         //   }
  //         // })
  //       });
  //       // }
  //       this.SetUserData(result.user);
  //     }).catch((error: any) => {
  //       this.uiCommonUtils.showSnackBar(error.message, 'Dismiss', 4000)
  //     })
  // }

  isEmail(userInput: string) {
    let regexEmail = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
    if (userInput.match(regexEmail)) {
      return true;
    } else {
      return false;
    }
  }


  doSignIn(data: any) {
    if (this.isEmail(data.data.username)) {
      this.signInWithFirebase(data)
    } else if (!this.isEmail(data.data.username)) {
      this.apiService.callGetService(`getEmail?userName=${data.data.username}`).subscribe((res) => {
        if (res.data.status === "success") {
          data.data.username = res.data.emailId
          this.signInWithFirebase(data);
        } else
          this.uiCommonUtils.showSnackBar('Invalid username or password!', 'error', 3000);
      });
    }
  }

  // data.data.username, data.data.password
  // Sign in with email/password for church project
  signInWithFirebase(data: any) {
    this.afAuth.auth.setPersistence('local')
      .then(() => {
        return this.afAuth.auth.signInWithEmailAndPassword(data.data.username, data.data.password)
          .then((result: any) => {
            // if (result.user?.emailVerified == false) {
            // this.uiCommonUtils.showSnackBar('Please verify your email.', 'error', 3000)
            // return;
            //} else {
            this.signedInUser = result.user;
            this.ngZone.run(() => {
              result.user?.getIdToken().then((token: string) => {
                localStorage.setItem('chUserToken', token);
                localStorage.setItem('chUserFbId', result.user?.uid);

                this.apiService.callGetService(`getUserApprovalStatus?fbuid=${result.user?.uid}`).subscribe((data) => {
                  if (data.data.status === 'failed') {
                    this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
                  } else {
                    this.userData = result.user;
                    localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData))
                    this.router.navigate(['/dashboard'])
                      // this.apiService.callGetService(`getUserMetaData?uid=${data.data.user}`).subscribe((data) => {
                      //   if (data.data.status == 'failed') {
                      //     this.uiCommonUtils.showSnackBar('Something went wrong!', 'error', 3000);
                      //   } else {
                      //     localStorage.setItem('chUserMetaData', JSON.stringify(data.data.metaData))
                      //     this.router.navigate(['/dashboard']);
                      //   }
                      // })
               
                  }
                })
              })
            });
            // }
          }).catch((error: any) => {
            this.uiCommonUtils.showSnackBar(error.message, 'Dismiss', 4000)
          })
      })
      .catch((error) => {
        this.uiCommonUtils.showSnackBar(error.message, 'error', 5000);
      });
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
        this.uiCommonUtils.showSnackBar('Password reset link has been sent to your email.', 'success', 5000)
      }).catch((error) => {
        console.log('Error occured while resetting password as : ' + error);
        if (error.code == 'auth/user-not-found')
          this.uiCommonUtils.showSnackBar('User does not exist in system.', 'error', 5000)
        else
          this.uiCommonUtils.showSnackBar('Something went wrong.', 'error', 5000);
      })
  }

  // Sign out
  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    })
  }

  deleteUserFromFirebase() {
    this.afAuth.user.subscribe(data => {
      data?.delete()
    })
  }

  updateEmailAddress(newEmailId: string) {
    return this.afAuth.auth.currentUser?.updateEmail(newEmailId);
  }

  sendEmailVaidation() {
    this.afAuth.auth.currentUser?.sendEmailVerification;
  }
}

