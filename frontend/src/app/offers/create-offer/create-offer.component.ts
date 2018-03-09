import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppOffer, ApiOffer, BaseOffer } from 'app/homepage-offer/offers.model';
import { AuthService } from 'app/auth.service';
import { User } from 'app/user';
import { Observable } from 'rxjs/Observable';
import { OffersService } from 'app/homepage-offer/offers.service';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { FileReaderEvent, FileReaderEventTarget } from '../../models';
import { NgForm, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Image } from 'app/homepage-offer/image.model';

@Component({
  selector: 'volontulo-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss']
})
export class CreateOfferComponent implements OnInit, OnDestroy {
  public djangoRoot = environment.djangoRoot;
  public file: File;
  public hasOrganization = false;
  public inEditMode = false;
  public isAdmin = false;
  public offer: AppOffer = new AppOffer;
  public reader = new FileReader();
  public user: User;
  public userSubscription: Subscription;
  public form: FormGroup;

  constructor(
    private authService: AuthService,
    private offersService: OffersService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      organization: ['', Validators.required],
      startedAt: ['', Validators.required],
      actionOngoing: ['', Validators.required],
      finishedAt: ['', Validators.required],
      constantCoop: [],
      recruitmentStartDate: ['', Validators.required],
      recruitmentEndDate: ['', Validators.required],
      volunteersLimit: [],
      reserveRecruitmentStartDate: [],
      reserveRecruitmentEndDate: [],
      reserveVolunteersLimit: [],
      description: ['', Validators.required],
      timeCommitment: ['', Validators.required],
      benefits: ['', Validators.required],
      requirements: ['', Validators.required],
      image: [],
    })

    if (this.authService.user$) {
      this.userSubscription = this.authService.user$
      .subscribe(
        response => {
          this.user = response;
          if (this.user) {
            this.isAdmin = this.user['isAdministrator'];
            this.hasOrganization = this.user['organizations'].length > 0;
          }
        }
      );
  }

    this.route.params
    .map(params => params.offerId)
    .filter(offerId => offerId !== undefined)
    .switchMap(offerId => this.offersService.getOffer(offerId))
    .do(offer => this.toDataUrl(offer.image, (base64) => this.offer.image = {
      content: base64,
      filename: 'image.jpg'
    }))
    .subscribe((response: BaseOffer) => {
      this.offer = response as AppOffer;
      this.inEditMode = true;
      this.form.patchValue(this.offer);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toDataUrl(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

  onSubmit(offer: AppOffer) {
    // TODO - delete those when we decide what date format we want to have
    offer.startedAt = offer.startedAt + 'T00:00:00Z';
    offer.finishedAt = offer.finishedAt + 'T00:00:00Z';

    if (!offer.recruitmentEndDate) {
      offer.recruitmentEndDate = null
    } else {
      offer.recruitmentEndDate = offer.recruitmentEndDate + 'T00:00:00Z';
    }
    if (!offer.recruitmentStartDate) {
      offer.recruitmentStartDate = null
    } else {
      offer.recruitmentStartDate = offer.recruitmentStartDate + 'T00:00:00Z';
    }
    if (!offer.reserveRecruitmentEndDate) {
      offer.reserveRecruitmentEndDate = null
    } else {
      offer.reserveRecruitmentEndDate = offer.reserveRecruitmentEndDate + 'T00:00:00Z';
    }
    if (!offer.reserveRecruitmentStartDate) {
      offer.reserveRecruitmentStartDate = null
    } else {
      offer.reserveRecruitmentStartDate = offer.reserveRecruitmentStartDate + 'T00:00:00Z';
    }

    this.form.value.image = this.offer.image;
    if (this.inEditMode) {
      this.offersService.editOffer(this.form.value, offer.id)
      .subscribe();
    } else {
      this.offersService.createOffer(this.form.value)
      .subscribe();
    }
  }

  onFileSelected(event) {
    this.file = event.target.files[0];
    this.reader.readAsDataURL(this.file)
    this.reader.onloadend = (a: FileReaderEvent) => {
      this.offer.image = {
        content: (a.currentTarget as FileReaderEventTarget).result,
        filename: 'image.jpg',
      }
     }
  }
}
