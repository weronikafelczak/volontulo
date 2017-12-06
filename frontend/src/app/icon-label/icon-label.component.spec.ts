import { IconComponent } from '../icon/icon.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconLabelComponent } from './icon-label.component';

describe('IconLabelComponent', () => {
  let component: IconLabelComponent;
  let fixture: ComponentFixture<IconLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IconLabelComponent,
        IconComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
