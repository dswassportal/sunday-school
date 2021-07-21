import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventExamRegistrationComponent } from './event-exam-registration.component';

describe('EventExamRegistrationComponent', () => {
  let component: EventExamRegistrationComponent;
  let fixture: ComponentFixture<EventExamRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventExamRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventExamRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
