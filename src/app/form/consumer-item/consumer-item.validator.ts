import { Directive } from '@angular/core';
import { AbstractControl, AsyncValidator, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/Operators";
import { ConsumerItemService } from "./consumer-item.service";

export function uniqueConsumerItemNameValidator(ConsumerItemService: ConsumerItemService): AsyncValidatorFn {
  return (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return ConsumerItemService.getConsumerItemByName(c.value).pipe(
      map(groupNames => {
        return groupNames && groupNames.entities.length > 0 ? { 'uniqueConsumerItemName': true } : null
      })
    );
  };
}
