import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'
declare let $: any;
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  signInForm: any;
  forgotPwdForm: any;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService) { }

    columnDefs!: any[];
    rowData: any;
    isFamilyHead = false;
    hide = true;
  ngOnInit(): void {
    this.signInForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]
      ),
      password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[@!#$%&*])(?=.*?[0-9]).{8,}$')]
    )
    });
    this.forgotPwdForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email])
    })

    
  }

  logIn() {
   
    if (this.signInForm.invalid) {
      return
    }
    else {
      this.authService.SignIn({ data: this.signInForm.value })

    //  if(this.isFamilyHead == false){
      //}
      // this.router.navigate(['/dashboard']);
    }
  }
  goToSignUp() {
    this.router.navigate(['/signup']);
  }

  resetPassword(emailAdd: string) {
    if (emailAdd.length == 0)
      return;
    else
       this.authService.forgotPassword(emailAdd);
       $("#myModal").modal("hide");
      this.router.navigate(['signin'])
  }


}

