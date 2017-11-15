import { environment } from '../../../environments/environment';
import { observable } from 'rxjs/symbol/observable';
import { Offer } from '../offers.model';
import { OffersService } from '../offers.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'volontulo-app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.css'],
})
export class OfferDetailComponent implements OnInit {
  public offer$: Observable<Offer>;
  public djangoRoot = environment.djangoRoot;
  public getDjangoViewUrl = this.offersService.getDjangoViewUrl; 

  constructor(
    private activatedRoute: ActivatedRoute,
    private offersService: OffersService,
  ) { }

  ngOnInit() {
    this.offer$ = this.activatedRoute.params
    .switchMap(params => this.offersService.getOffer(params.offerId));
  }
}
