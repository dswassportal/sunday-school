import { Injectable } from '@angular/core';


var thisData = {};


@Injectable({
  providedIn: 'root',
})


export class FamilyMemberDetails {

    constructor() { }

    getSelectedRowData(): any {
        return thisData;
    }
    setSelectedRowData(data: any) {  
        return thisData = data;
    }

    getDataService(): FamilyMemberDetails {
        return this;
    }



}