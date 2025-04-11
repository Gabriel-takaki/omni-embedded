import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockinlistComponent } from '../clockinlist.component';

describe('ClockinlistComponent', () => {
  let component: ClockinlistComponent;
  let fixture: ComponentFixture<ClockinlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClockinlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClockinlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
