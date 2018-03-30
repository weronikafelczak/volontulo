import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppOffer, ApiOffer, BaseOffer } from 'app/homepage-offer/offers.model';
import { AuthService } from 'app/auth.service';
import { User } from 'app/user';
import { Observable } from 'rxjs/Observable';
import { OffersService } from 'app/homepage-offer/offers.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { FileReaderEvent, FileReaderEventTarget } from '../../models';
import { NgForm, FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Image } from 'app/homepage-offer/image.model';
import { Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'volontulo-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss']
})
export class CreateOfferComponent implements OnInit, OnDestroy {
  public djangoRoot = environment.djangoRoot;
  public hasOrganization = false;
  public inEditMode = false;
  public isAdmin = false;
  public isFileToBig = false;
  public offer: AppOffer = new AppOffer;
  public reader = new FileReader();
  public user: User;
  public userSubscription: Subscription;
  public form: FormGroup;
  public error;

  constructor(
    private authService: AuthService,
    private offersService: OffersService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      organization: ['', Validators.required],
      startedAt: ['', Validators.required],
      actionOngoing: [false],
      finishedAt: ['', Validators.required],
      constantCoop: [false],
      recruitmentStartDate: [null],
      recruitmentEndDate: [null],
      volunteersLimit: [],
      reserveRecruitmentStartDate: [null],
      reserveRecruitmentEndDate: [null],
      reserveVolunteersLimit: [],
      description: ['', Validators.required],
      timeCommitment: ['', Validators.required],
      benefits: ['', Validators.required],
      requirements: [''],
      image: [],
    })

      this.userSubscription = this.authService.user$
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.isAdmin = user['isAdministrator'];
          this.hasOrganization = user['organizations'].length > 0;
        }
     });

    this.activatedRoute.params
    .map(params => params.offerId)
    .filter(offerId => offerId !== undefined)
    .switchMap(offerId => this.offersService.getOffer(offerId))
    .do(offer => this.toDataUrl(offer.image))
    .subscribe((response: BaseOffer) => {
      this.offer = response as AppOffer;
      this.inEditMode = true;
      this.offer = this.removeTime();
      this.form.patchValue(this.offer);
    });
  }

// Temporary fix to make editing work properly, to delete after we fix datetime issue
  removeTime() {
    this.offer.startedAt = this.offer.startedAt.replace(/T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$/, '');
    this.offer.finishedAt = this.offer.finishedAt.replace(/T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$/, '');
    if (this.offer.recruitmentEndDate) {
      this.offer.recruitmentEndDate = this.offer.recruitmentEndDate.replace(/T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$/, '');
    };
    if (this.offer.recruitmentStartDate) {
      this.offer.recruitmentStartDate = this.offer.recruitmentStartDate.replace(/T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$/, '');
    };
    if (this.offer.reserveRecruitmentEndDate) {
      this.offer.reserveRecruitmentEndDate = this.offer.reserveRecruitmentEndDate.replace(/T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$/, '');
    }
    if (this.offer.reserveRecruitmentStartDate) {
      this.offer.reserveRecruitmentStartDate = this.offer.reserveRecruitmentStartDate.replace(/T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$/, '');
    }
    return this.offer;
  }

  // TODO - delete when we decide what date format we want to have
  addTime() {
    this.form.value.startedAt = this.form.value.startedAt + 'T00:00:00Z';
    this.form.value.finishedAt = this.form.value.finishedAt + 'T00:00:00Z';

    if (this.form.value.recruitmentEndDate) {
      this.form.value.recruitmentEndDate = this.form.value.recruitmentEndDate + 'T00:00:00Z';
    }
    if (this.form.value.recruitmentStartDate) {
      this.form.value.recruitmentStartDate = this.form.value.recruitmentStartDate + 'T00:00:00Z';
    }
    if (this.form.value.reserveRecruitmentEndDate) {
      this.form.value.reserveRecruitmentEndDate = this.form.value.reserveRecruitmentEndDate + 'T00:00:00Z';
    }
    if (this.form.value.reserveRecruitmentStartDate) {
      this.form.value.reserveRecruitmentStartDate = this.form.value.reserveRecruitmentStartDate + 'T00:00:00Z';
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    };
  }

  toDataUrl(url) {
    const reader = new FileReader();
    this.http.get(url, {responseType: 'blob'})
    .subscribe(response => {
      reader.onloadend = () => {
        this.offer.image = {
        content: reader.result,
        filename: 'image.jpg'
      }
    }
      reader.readAsDataURL(response);
    })
  };

  onSubmit(offer: AppOffer) {
    if (this.form.valid) {
      this.addTime()
    }
    if (this.offer.image) {
      this.form.value.image = { ...this.offer.image };
      this.form.value.image.content = this.form.value.image.content.replace(/.*,/, '');
    }
    if (this.inEditMode) {
      this.offersService.editOffer(this.form.value, offer.id)
      .subscribe(
        (response: ApiOffer) => this.router.navigate(['offers/' + response.slug + '/' + response.id]),
        err => this.error = true
    );
    } else {
      this.offersService.createOffer(this.form.value)
      .subscribe(
        (response: ApiOffer) => this.router.navigate(['offers/' + response.slug + '/' + response.id]),
        err => this.error = true
      );
    }
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    this.reader.onloadend = (a: FileReaderEvent) => {
      if (file.size > 1048576) {
        return this.isFileToBig = true;
      }
      this.offer.image = {
        content: (a.currentTarget as FileReaderEventTarget).result,
        filename: 'image.jpg',
      }
     }
     this.reader.readAsDataURL(file)
    this.isFileToBig = false;
  }

  isFormInputInvalid(inputStringId: string): boolean {
    const input = this.form.get(inputStringId);
    return !input.valid && input.touched || (this.error && !input.valid);
  }
}
