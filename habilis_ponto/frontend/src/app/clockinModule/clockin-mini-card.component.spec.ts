import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockinMiniCardComponent } from './clockin-mini-card.component';

describe('ClockinMiniCardComponent', () => {
  let component: ClockinMiniCardComponent;
  let fixture: ComponentFixture<ClockinMiniCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClockinMiniCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClockinMiniCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
