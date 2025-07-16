// **************************************************
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import * as Interfaces from '../_interfaces/persian-date';
// **************************************************

@Component({
  selector: 'app-persian-calendar',
  templateUrl: './persian-calendar.component.html',
  styleUrls: ['./persian-calendar.component.css']
})
export class PersianCalendarComponent implements OnInit {

  constructor() {

    this.minYear = 1300;
    this.maxYear = 1400;

  }

  @Input() public minYear: number;
  @Input() public maxYear: number;
  @Input() public date: Interfaces.PersianDate;

  public ngOnInit() { }

}
