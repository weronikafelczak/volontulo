import { Offer } from './offers.model';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';



@Injectable()
export class OffersService {
  private url = `${environment.apiRoot}/offers/`;
  private _offer$ = new BehaviorSubject<Offer>(null);
  public offer$ = this._offer$.asObservable();
  constructor (private http: Http) { }

  getOffers() {
    return this.http.get(this.url, { withCredentials: true } )
      .map((res: Response) => res.json())
      .map(offers => {
        for (const offer of offers) {
          this.loadDefaultImage(offer);
        }
        return offers;
      });
  }

  getOffer(id: number): Observable<Offer> {
    return this.http.get(`${this.url}${id}/`, { withCredentials: true })
      .map(response => {
        this._offer$.next(response.json());
        this.loadDefaultImage(response.json());
        return response.json();}
      );
  }

  loadDefaultImage(offer: Offer): Offer {
    if (offer.image === null) {
        offer.image = 'assets/img/banner/volontulo_baner.png';
        this._offer$.next(offer);
    }
    return offer;
  }

  getJoinViewUrl(offer: Offer): string {
    return `${environment.djangoRoot}/offers/${offer.slug}/${offer.id}/join`;
  }

  postOffer(offer: Offer) {
    return this.http.post(`${environment.apiRoot}/offers/create`, offer)
    .map(response => {
      console.log("here!")
      if (response.status === 201) {
        return 'success';
      }
    })
  }


}
