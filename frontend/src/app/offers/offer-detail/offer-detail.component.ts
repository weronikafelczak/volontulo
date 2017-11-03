import { Offer } from '../offers.model';
import { OffersService } from '../offers.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.css'],
})
export class OfferDetailComponent implements OnInit {
  public offer: Offer;

  constructor(
    private activatedRoute: ActivatedRoute,
    private offersService: OffersService,

  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      console.log(params);
      this.offersService.getOffer(params.offerId).subscribe((offer: Offer) => {
        console.log(offer);
        this.offer = offer;
      });
    });

  }

}
