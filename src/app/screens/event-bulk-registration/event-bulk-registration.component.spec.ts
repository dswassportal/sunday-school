import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventBulkRegistrationComponent } from './event-bulk-registration.component';

describe('EventBulkRegistrationComponent', () => {
  let component: EventBulkRegistrationComponent;
  let fixture: ComponentFixture<EventBulkRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventBulkRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventBulkRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
