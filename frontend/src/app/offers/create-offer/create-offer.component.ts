import { Component, OnInit } from '@angular/core';
import { Offer } from 'app/homepage-offer/offers.model';
import { AuthService } from 'app/auth.service';
import { User } from 'app/user';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { OffersService } from 'app/homepage-offer/offers.service';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'volontulo-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss']
})
export class CreateOfferComponent implements OnInit {
  createOrEdit = 'Tworzenie';
  djangoRoot: string;
  edit = false;
  offer: Offer = new Offer;
  user: User;
  isAdmin = false;
  hasOrganization = false;

  constructor(
    private authService: AuthService,
    private offersService: OffersService,
    private route: ActivatedRoute,
  ) {
      this.djangoRoot = environment.djangoRoot;
  }

  ngOnInit() {
    this.authService.user$
    .subscribe(
      (response) => {
        this.user = response;
        if(this.user !== null){
          this.isAdmin = this.user["isAdministrator"];
          this.hasOrganization = this.user["organizations"].length > 0;
        }
      }
    );

    this.route.params
    .subscribe(
      (params) => {
        if (params.offerId !== undefined){
        this.offersService.getOffer(params.offerId)
        .subscribe(
          response => {
          this.offer = response;
          this.edit = true;
          this.createOrEdit = "Edycja";
        })
      }
    });
  }

  onSubmit(offer){
    // TODO - delete those when we decide what date format we want to have
    offer.startedAt = offer.startedAt + "T00:00:00Z";
    offer.finishedAt = offer.finishedAt + "T00:00:00Z";

    if(offer.reserveRecruitmentEndDate == undefined) {
      offer.reserveRecruitmentEndDate = null
    }
    if(offer.reserveRecruitmentStartDate == undefined) {
      offer.reserveRecruitmentStartDate = null
    }
    
    if(this.edit==true){
      this.offersService.editOffer(offer, offer.id)
      .subscribe();
    } else {
      this.offersService.postOffer(offer)
      .subscribe();
    }
  }

}
