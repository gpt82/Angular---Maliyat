import { Directive } from '@angular/core';
import {AbstractControl, AsyncValidator, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors} from "@angular/forms";
import {Observable} from "rxjs";
import {map} from "rxjs/Operators";
import {GoodsService} from "./goods.service";

export function uniqueGoodsNameValidator(GoodsService: GoodsService) : AsyncValidatorFn {
  return (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return GoodsService.getGoodsByName(c.value).pipe(
      map(groupNames => {
        return groupNames && groupNames.entities.length > 0 ? {'uniqueGoodsName': true} : null})
    );
  };
}

export function uniqueGoodsCodeValidator(GoodsService: GoodsService) : AsyncValidatorFn {
  return (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return GoodsService.getGoodsByCode(c.value).pipe(
      map(groupNames => {
        return groupNames && groupNames.entities.length > 0 ? {'uniqueGoodsCode': true} : null})
    );
  };
}
// @Directive({
//   selector: '[uniqueGoodsName]',
//   providers:[{provide: NG_ASYNC_VALIDATORS, useExisting: UniqueGoodsNameValidatorDirective, multi: true} ]
// })
//
// export class UniqueGoodsNameValidatorDirective implements AsyncValidator {
//
//   constructor(private GoodsService: GoodsService) { }
//
//   validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>{
//     return uniqueGoodsNameValidator(this.GoodsService)(c);
//   }
// }
