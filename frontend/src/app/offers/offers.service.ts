import { Offer } from './offers.model';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';
import { Offer } from './offers.model';

@Injectable()
export class OffersService {
  private url = `${environment.apiRoot}/offers/`;
  // Why this doesn't work, while same code in component.html works?
  // public joinOffer = `${environment.djangoRoot}/offers/{{offer.slug}}/{{offer.id}}/join`;
  constructor (private http: Http) { }

  getOffers() {
    return this.http.get(this.url, { withCredentials: true } )
      .map((res: Response) => res.json());
  }

  getOffer(id: number): Observable<Offer> {
    return this.http.get(`${this.url}${id}/`, { withCredentials: true } )
      .map((res: Response) => res.json());
  }

  getDjangoViewUrl(offer: Offer): string {
    return `${environment.djangoRoot}/offers/${offer.slug}/${offer.id}`;
 }
}
