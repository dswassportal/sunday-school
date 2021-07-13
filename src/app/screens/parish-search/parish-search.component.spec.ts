import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParishSearchComponent } from './parish-search.component';

describe('ParishSearchComponent', () => {
  let component: ParishSearchComponent;
  let fixture: ComponentFixture<ParishSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParishSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParishSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
