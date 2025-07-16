// **************************************************
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Output } from '@angular/core';
import { Component } from '@angular/core';
import { EventEmitter } from '@angular/core';
// **************************************************

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'numeric-select',
  templateUrl: './numeric-select.component.html',
  styleUrls: ['./numeric-select.component.css']
})
export class NumericSelectComponent implements OnInit {
  public constructor() {
    this.numbers = [];
  }

  public numbers: number[];

  @Input() public min: number;
  @Input() public max: number;
  @Input() public value?: number;
  @Output() public valueChanged = new EventEmitter<number>();

  ngOnInit() {
    for (let index = this.min; index <= this.max; index++) {
      this.numbers.push(index);
    }
  }

  public selectedItemChanged(newValue: number): void {
    this.valueChanged.emit(newValue);
  }
}
