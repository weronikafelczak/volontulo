import 'rxjs/add/operator/switchMap';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { ApiOffer } from '../../homepage-offer/offers.model';
import { OffersService } from '../../homepage-offer/offers.service';
import { User } from 'app/user';
import { AuthService } from 'app/auth.service';
import { Organization } from 'app/organization/organization.model';
import { combineLatest } from 'rxjs/operators/combineLatest';

@Component({
  selector: 'volontulo-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss'],
})
export class OfferDetailComponent implements OnInit {
  public offer$: Observable<ApiOffer>;
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
    this.user$ = this.authService.user$;

    this.offer$ = this.offersService.offer$;

    this.activatedRoute.params
    .switchMap(params => this.offersService.getOffer(params.offerId))
    .subscribe();
  

    this.isUserOrgMember$ = this.offer$
    .pipe(combineLatest(this.user$, (offer, user): boolean =>{
        if (offer && user) {
            const filteredOrganizations = user.organizations.filter(organ => organ.id === offer.organization.id);
            return filteredOrganizations.length > 0;
            }
        return false;
       }));
  }
}

