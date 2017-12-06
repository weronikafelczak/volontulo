import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'volontulo-icon-label',
  templateUrl: './icon-label.component.html',
  styleUrls: ['./icon-label.component.css']
})
export class IconLabelComponent implements OnInit {
  @Input() icon: string;
  @Input() content: string;

  constructor() { }

  ngOnInit() {
  }

}
