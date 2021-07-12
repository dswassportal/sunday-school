import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SundaySchoolAttendanceComponent } from './sunday-school-attendance.component';

describe('SundaySchoolAttendanceComponent', () => {
  let component: SundaySchoolAttendanceComponent;
  let fixture: ComponentFixture<SundaySchoolAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SundaySchoolAttendanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SundaySchoolAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
