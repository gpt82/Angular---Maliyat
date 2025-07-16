import { Directive } from '@angular/core';
import {AbstractControl, AsyncValidator, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors} from "@angular/forms";
import {Observable} from "rxjs";
import {map} from "rxjs/Operators";
import {CarTypeService} from "./car-type.service";

export function uniqueCarTypeNameValidator(CarTypeService: CarTypeService) : AsyncValidatorFn {
  return (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return CarTypeService.getCarTypeByName(c.value).pipe(
      map(groupNames => {
        return groupNames && groupNames.entities.length > 0 ? {'uniqueCarTypeName': true} : null})
    );
  };
}

export function uniqueCarTypeCodeValidator(CarTypeService: CarTypeService) : AsyncValidatorFn {
  return (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return CarTypeService.getCarTypeByCode(c.value).pipe(
      map(groupNames => {
        return groupNames && groupNames.entities.length > 0 ? {'uniqueCarTypeCode': true} : null})
    );
  };
}
// @Directive({
//   selector: '[uniqueCarTypeName]',
//   providers:[{provide: NG_ASYNC_VALIDATORS, useExisting: UniqueCarTypeNameValidatorDirective, multi: true} ]
// })
//
// export class UniqueCarTypeNameValidatorDirective implements AsyncValidator {
//
//   constructor(private CarTypeService: CarTypeService) { }
//
//   validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>{
//     return uniqueCarTypeNameValidator(this.CarTypeService)(c);
//   }
// }
