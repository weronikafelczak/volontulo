import 'rxjs/add/operator/switchMap';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { Offer } from '../../homepage-offer/offers.model';
import { OffersService } from '../../homepage-offer/offers.service';
import { User } from 'app/user';
import { AuthService } from 'app/auth.service';
import { Organization } from 'app/organization/organization.model';

@Component({
  selector: 'volontulo-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss'],
})
export class OfferDetailComponent implements OnInit {
  public offer$: Observable<Offer>;
  public djangoRoot = environment.djangoRoot;
  public getJoinViewUrl = this.offersService.getJoinViewUrl;
  isUserOrgMember$: Observable<boolean>;
  user$: Observable<User | null>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private offersService: OffersService,
  ) { }

  ngOnInit() {
    this.user$ = this.authService.user$

    this.offer$ = this.offersService.offer$

    this.activatedRoute.params
    .switchMap(params => this.offersService.getOffer(params.offerId))
    .subscribe();
  
    this.isUserOrgMember$ = this.offer$
     .combineLatest(this.user$, (offer, user): boolean => {
       if (offer === null || user === null) {
         return false
       } else { 
         return user.organizations.filter(organ => organ.id === offer.organization.id).length > 0
        }
     });
  }
}
