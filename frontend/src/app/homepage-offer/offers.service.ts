import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { loadDefaultImage } from './offer.utils';
import { Offer } from './offers.model';


@Injectable()
export class OffersService {
  private url = `${environment.apiRoot}/offers/`;

  constructor (
    private http: HttpClient,
    private router: Router,
  ) { }

  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.url)
      .map(offers => offers.map(offer => loadDefaultImage(offer)));
  }

  getOffer(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.url}${id}/`)
    .catch(error => {
      this.router.navigate(['page-404']);
      return Observable.of(error);
   })
    .map(offer => loadDefaultImage(offer));
  }

  getJoinViewUrl(offer: Offer): string {
    return `${environment.djangoRoot}/offers/${offer.slug}/${offer.id}/join`;
  }

}
