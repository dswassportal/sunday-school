import { Injectable } from '@angular/core';


var thisData = {};


@Injectable({
  providedIn: 'root',
})


export class EventExamRegistration {

    constructor() { }

    getSelectedRowData(): any {
        return thisData;
    }
    setSelectedRowData(data: any) {  
        return thisData = data;
    }

    getDataService(): EventExamRegistration {
        return this;
    }



}