import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private eventSubject: Subject<boolean> = new Subject<boolean>();

  public readonly statusChanged$: Observable<boolean> = this.eventSubject.asObservable();

  private loggedIn = false;
  helper: any;

  constructor(
    
    public router: Router,
    public authService: AuthService,
    
   ) { 
     
   }

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  //   if(this.authService.getSignedInUserName()){
  //     return true;
  //   }else{
      
  //     return this.router.navigate(['signin']);;
  //   }
  // }

 
  /*
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }*/
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
   if(localStorage.getItem('chUserMetaData')){
    //this.router.navigate(['/dashboard']);
    return true;
   }
   else{
     this.router.navigate(['/signin']);
     return false;
   }
  } 
  

  
}
