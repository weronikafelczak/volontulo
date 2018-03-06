import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { Offer } from './offers.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class OffersService {
  private url = `${environment.apiRoot}/offers/`;
  private _offer$ = new BehaviorSubject<Offer>(null);
  public offer$ = this._offer$.asObservable();

  constructor (private http: HttpClient) { }

  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.url)
      .map(offers => offers.map(offer => this.loadDefaultImage(offer)));
  }

  getOffer(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.url}${id}/`)
      .map(offer => this.loadDefaultImage(offer));
  }

  loadDefaultImage(offer: Offer): Offer {
    if (!offer.image) {
        offer.image = 'assets/img/banner/volontulo_baner.png';
        this._offer$.next(offer);
    }
    return offer;
  }

  getJoinViewUrl(offer: Offer): string {
    return `${environment.djangoRoot}/offers/${offer.slug}/${offer.id}/join`;
  }

  createOffer(offer: Offer)  {
    return this.http.post(`${environment.apiRoot}/offers/`, offer, { withCredentials: true })
    .map(response => {
      if (response === 201) {
        return 'success';
      }
    })
  }

  editOffer(offer: Offer, id: number) {
    return this.http.put(`${environment.apiRoot}/offers/${id}/`, offer, { withCredentials: true })
    .map(response => {
      if (response === 201) {
        return 'success';
      }
    })
  }

}
