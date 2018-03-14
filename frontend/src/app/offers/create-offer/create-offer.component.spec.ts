import { ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { AuthService } from '../../auth.service';
import { CreateOfferComponent } from './create-offer.component';
import { OffersService } from '../../homepage-offer/offers.service';

describe('CreateOfferComponent', () => {
  let component: CreateOfferComponent;
  let fixture: ComponentFixture<CreateOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [ CreateOfferComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: new Subject()
          },
        },
      {
        provide: AuthService,
        useValue: {
          user$: new Subject(),
        }
      },
      {
        provide: OffersService,
        useValue: {},
      }
    ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });this
});
