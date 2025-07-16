import { Injectable } from '@angular/core';
import * as Interfaces from '../../../shared/_interfaces/persian-date';
export interface trailerActivityFormState {
    agendaType: number;
    receiveTypes?: number;
    tonnageTypeId?: number;
    trailerId?: number;
    agendaCount: number;
    branchIds : any[];
    fromDate: Interfaces.PersianDate;
    toDate: Interfaces.PersianDate;
}
@Injectable()
export abstract class TrailerActivity {
getState<T>(): T {
    const settings = localStorage.getItem('trailerActivityFormState');
    return settings ? JSON.parse(settings) : settings;
  }

  setState<T>(token: string, config: trailerActivityFormState): void {
    localStorage.setItem(token, JSON.stringify(config));
    // localStorage.setItem(token+'column', JSON.stringify(visibleCol));
  }
}