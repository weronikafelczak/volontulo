import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ApiOffer } from './offers.model';
import { OffersService } from './offers.service';
import { OrganizationService } from '../organization/organization.service';
import { OnChanges }  from '@angular/core';

@Component({
  selector: 'volontulo-homepage-offer',
  templateUrl: './homepage-offer.component.html',
  styleUrls: ['./homepage-offer.component.scss'],
  providers: [OffersService, OrganizationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageOfferComponent {
  @Input() offer: ApiOffer;


}

