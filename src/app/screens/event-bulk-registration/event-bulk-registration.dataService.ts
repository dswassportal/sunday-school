import { Injectable } from '@angular/core';


var thisData = {};


@Injectable({
  providedIn: 'root',
})


export class EventBulkRegistration {

    constructor() { }

    getSelectedRowData(): any {
        return thisData;
    }
    setSelectedRowData(data: any) {  
        return thisData = data;
    }

    getDataService(): EventBulkRegistration {
        return this;
    }



}
