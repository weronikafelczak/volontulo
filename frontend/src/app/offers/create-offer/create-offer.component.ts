import 'rxjs/add/operator/filter';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppOffer, ApiOffer } from 'app/homepage-offer/offers.model';
import { AuthService } from 'app/auth.service';
import { User } from 'app/user';
import { Observable } from 'rxjs/Observable';
import { OffersService } from 'app/homepage-offer/offers.service';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { FileReaderEvent, FileReaderEventTarget } from '../../models';

@Component({
  selector: 'volontulo-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss']
})
export class CreateOfferComponent implements OnInit {
  public djangoRoot = environment.djangoRoot;
  public file: File;
  public hasOrganization = false;
  public inEditMode: boolean = false;
  public isAdmin: boolean = false;
  public offer: AppOffer = new AppOffer;
  public reader = new FileReader();
  public user: User;
  public userSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private offersService: OffersService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.user$
    .subscribe(
      response => {
        this.user = response;
        if(this.user){
          this.isAdmin = this.user["isAdministrator"];
          this.hasOrganization = this.user["organizations"].length > 0;
        }
      }
    );

    this.route.params
    .map(params => params.offerId)
    .filter(offerId => offerId !== undefined)
    .switchMap(offerId => this.offersService.getOffer(offerId))
    // .map(offer: ApiOffer =>  )
    .subscribe(response => {
      this.offer = response;
      this.inEditMode = true;
    });
  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }


  onSubmit(offer: AppOffer){
    // TODO - delete those when we decide what date format we want to have
    offer.startedAt = offer.startedAt + "T00:00:00Z";
    offer.finishedAt = offer.finishedAt + "T00:00:00Z";
    offer.recruitmentStartDate = offer.recruitmentStartDate + "T00:00:00Z";
    offer.recruitmentEndDate = offer.recruitmentEndDate + "T00:00:00Z";

    if(!offer.reserveRecruitmentEndDate) {
      offer.reserveRecruitmentEndDate = null
    } else {
      offer.reserveRecruitmentEndDate = offer.reserveRecruitmentEndDate + "T00:00:00Z";
    }
    if(!offer.reserveRecruitmentStartDate) {
      offer.reserveRecruitmentStartDate = null
    } else {
      offer.reserveRecruitmentStartDate = offer.reserveRecruitmentStartDate + "T00:00:00Z";
    }
    
    if(this.inEditMode){
      this.offersService.editOffer(offer, offer.id)
      .subscribe();
    } else {
      this.offersService.createOffer(offer)
      .subscribe();
    }
  }

  onFileSelected(event) {
    this.file = event.target.files[0];
    this.reader.readAsDataURL(this.file)
    this.reader.onloadend = (a: FileReaderEvent) =>
     {
      this.offer.image = {
        content: (a.currentTarget as FileReaderEventTarget).result,
        filename: "image.jpg",
      }
     }
  }

}
