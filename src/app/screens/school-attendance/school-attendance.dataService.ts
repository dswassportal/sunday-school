import { Injectable } from '@angular/core';


var thisData = {};


@Injectable({
  providedIn: 'root',
})


export class SchoolAttendance {

    constructor() { }

    getSelectedRowData(): any {
        return thisData;
    }
    setSelectedRowData(data: any) {  
        return thisData = data;
    }

    getDataService(): SchoolAttendance {
        return this;
    }



}