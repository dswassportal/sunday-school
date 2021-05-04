import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signUpForm: any;
  contactNo: any;
  max_date!: any;
  parishList!: any[];
  hide = true;
  hide1 = true;
  minDate = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private AuthService : AuthService ,
    private apiService : ApiService
    ) { }


  ngOnInit(): void {
    this.signUpForm = this.formBuilder.group({
      title : new FormControl('',Validators.required),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      dob: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[@])(?=.*?[0-9]).{8,}$')]),
      cnfmpwd: new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[@])(?=.*?[0-9]).{8,}$')]),
      mobileNo: new FormControl('', [Validators.required, Validators.pattern('[0-9].{9}')]),
      memberType : new FormControl('',Validators.required),
      orgId: new FormControl('',Validators.required),
      abtyrslf: new FormControl('')
    });

    this.max_date = new Date;
    this.apiService.getParishListData().subscribe(res => {

     for(let i=0;i<res.data.metaData.Parish.length;i++){
       this.parishList = res.data.metaData.Parish;
     }
      console.log(this.parishList);
    })
 
  }

  signUp() {
    var password = this.signUpForm.controls.password.value;
    var confirmPassword = this.signUpForm.controls.cnfmpwd.value;
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      // return false;
    }
    else
      if (this.signUpForm.invalid) {
        return
      }
      else {
        this.signUpForm.value.mobileNo = this.contactNo;
        this.signUpForm.value.middleName = null;
         this.AuthService.SignUp(this.signUpForm.value).then((data)=>{
          console.log(JSON.stringify(data));
         })
        console.log("user registered");
      }
     this.signUpForm.reset();
  }

  isStateDataSet = false;
  keyPress(event: any) {
    this.isStateDataSet = false;
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 5 && !pattern.test(inputChar)) {
      event.preventDefault();
      if (event.keyCode == 13){
//this.change(event);
    console.log("keyCode == 13");
      }
    } 
  }

  cancel() {
    this.router.navigate(['/signin']);
  }

  goToLogin() {
    this.router.navigate(['/signin']);
  }

  getNumber(event: any) {
    console.log(event);
    this.contactNo = event;
  }

  validateDOB(event:any){
    let year = new Date(event).getFullYear();
    let today = new Date().getFullYear();
if(year > today){
  alert("Select Date in Past");
}
  }

}



