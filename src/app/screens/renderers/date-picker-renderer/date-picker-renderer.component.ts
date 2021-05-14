import { Component, OnInit } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';
@Component({
  selector: 'app-date-picker-renderer',
  templateUrl: './date-picker-renderer.component.html',
  styleUrls: ['./date-picker-renderer.component.css']
})
export class DatePickerRendererComponent implements AgRendererComponent {

  params: any;
  minDate:any;
  maxDate:any;

  agInit(params: any): void {
    this.params = params;
    this.minDate = new Date(params.data.startDate);
    this.maxDate = new Date(params.data.endDate);
  }

  refresh(event: any): boolean {

    // try {
    if (event.event) {
      event.params.data.pickedDate = new Date(event.event.value).toISOString()
      event.params.api.refreshCells(event.params);
    } else
      event.api.refreshCells(event);


    return false;

    // } catch (err) { }
    return false;
    //}
  }

}
