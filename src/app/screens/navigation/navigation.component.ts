import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor() { }
  opened = true;
  userMetaData:any;
  numberOfMenusElements : any;
  ngOnInit(): void {

    this.userMetaData = JSON.parse(localStorage.getItem('chUserMetaData') || '{}');
    console.log('userMetaData is :' + JSON.stringify(this.userMetaData))

    this.numberOfMenusElements = this.userMetaData.menus.length;
    console.log(' available User menu are : ' + JSON.stringify(this.userMetaData.menus[0]));
    console.log(' available User menu are : ' + JSON.stringify(this.userMetaData.menus[1]));
    
    console.log(' available Menu length is : ' + this.numberOfMenusElements);

    

  }
}
