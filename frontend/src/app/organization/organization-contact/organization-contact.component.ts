import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { OrganizationContactPayload } from '../organization.model';
import { ContactStatus } from '../organization.interfaces';

@Component({
  selector: 'volontulo-organization-contact',
  templateUrl: './organization-contact.component.html',
  styleUrls: ['./organization-contact.component.scss']
})
export class OrganizationContactComponent implements OnChanges {
  @ViewChild('contactForm') contactForm: NgForm;
  @Output() contact = new EventEmitter<OrganizationContactPayload>();
  @Input() contactStatus: ContactStatus;
  submitDisabled = false;
  alertSuccessClosed = true;
  alertErrorClosed = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.contactStatus.currentValue && changes.contactStatus.currentValue.status === 'success') {
      this.alertSuccessClosed = false;
      this.contactForm.reset();
    } else if (changes.contactStatus.currentValue && changes.contactStatus.currentValue.status === 'error') {
      this.alertErrorClosed = false;
    }
    this.submitDisabled = false;
  }

  onSubmit() {
    if (!this.contactForm.value.honeyBunny) {
      this.contact.emit(this.contactForm.value as OrganizationContactPayload);
      this.submitDisabled = true;
    }
  }
}
