import * as Interfaces from '../_interfaces/persian-date';

export class PersianDate implements Interfaces.PersianDate {

  public constructor
    (year: number | null = null,
    month: number | null = null,
    day: number | null = null) {

    this.day = day;
    this.year = year;
    this.month = month;

  }

  public day: number | null;
  public year: number | null;
  public month: number | null;

  toString(): string {
    return this.year + '/' + this.month + '/' + this.day;
  }

}
