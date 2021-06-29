import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkRegistrationComponent } from './bulk-registration.component';

describe('BulkRegistrationComponent', () => {
  let component: BulkRegistrationComponent;
  let fixture: ComponentFixture<BulkRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
