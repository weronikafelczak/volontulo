import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { Organization, OrganizationContactPayload } from './organization.model';
import { ContactStatus } from './organization.interfaces';
import { ApiOffer } from '../homepage-offer/offers.model';
import { loadDefaultImage } from '../homepage-offer/offer.utils';
import { environment } from '../../environments/environment';

@Injectable()
export class OrganizationService {
  private url = `${environment.apiRoot}/organizations/`;

  private contactStatusEvent = new Subject<ContactStatus>();
  private organizationEvent = new BehaviorSubject<Organization | null>(null);
  private organizationsEvent = new Subject<Organization[]>();
  private offersEvent = new Subject<ApiOffer[]>();

  public contactStatus$: Observable<ContactStatus> = this.contactStatusEvent.asObservable();
  public organization$: Observable<Organization | null> = this.organizationEvent.asObservable();
  public organizations$: Observable<Organization[]> = this.organizationsEvent.asObservable();
  public offers$: Observable<ApiOffer[]> = this.offersEvent.asObservable();

  constructor(private http: HttpClient) { }

  getOrganization(id: number) {
    return this.http.get<Organization>(`${this.url}${id}/`)
      .subscribe(organization => this.organizationEvent.next(organization));
  }

  sendContactForm(organization: Organization, contactData: OrganizationContactPayload) {
    this.http.post(
      `${this.url}${organization.id}/contact/`,
      contactData,
      { observe: 'response' })
      .subscribe(
        (response: HttpResponse<any>) => {
          if (response.status !== 201) {
            this.contactStatusEvent.next({ data: contactData, status: 'error' });
          } else {
            this.contactStatusEvent.next({ data: contactData, status: 'success' });
          }
        },
        err => this.contactStatusEvent.next({ data: contactData, status: 'error' }),
      );
  }

  getOrganizationViewUrl(organization: Organization): string {
    return `${environment.djangoRoot}/organizations/${organization.slug}/${organization.id}`;
  }

  getOrganizationCreateViewUrl(): string {
    return `${environment.djangoRoot}/organizations/create`;
  }

  getOrganizations() {
    return this.http.get<Organization[]>(this.url)
      .subscribe(organizations => this.organizationsEvent.next(organizations));
  }

  getOffersForOrganization(id: number) {
    return this.http.get<ApiOffer[]>(`${this.url}${id}/offers/`)
      .map(offers => offers.map(offer => loadDefaultImage(offer)))
      .subscribe(offers => this.offersEvent.next(offers));
  }
}
