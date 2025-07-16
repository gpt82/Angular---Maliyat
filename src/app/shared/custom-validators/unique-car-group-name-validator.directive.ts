import {AbstractControl, AsyncValidatorFn, ValidationErrors} from "@angular/forms";
import {Observable, of} from "rxjs";
import {CarGroupService} from "../../form/car-group/car-group.service";
import { map} from "rxjs/operators";
import {AgentService} from "../../form/agent/agent.service";


export function uniqueCarGroupNameValidator(carGroupService: CarGroupService): AsyncValidatorFn {
  return (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    if (c.value === this.data.Agent.code) { return null; }
    return carGroupService.getCarGroupByName(c.value).pipe(
      map(groupNames => {
        return groupNames && groupNames.entities.length > 0 ? {'uniqueCarGroupName': true} : null
      })
    );
  };
}

export function uniqueAgentCodeValidator(agentService: AgentService): AsyncValidatorFn {
  return (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return agentService.getAgentByCode(c.value).pipe(
      map(codes => {
        return codes ? {'uniqueAgentCode': true} : null
      })
    );
  };
}

// @Directive({
//   selector: '[uniqueCarGroupName]',
//   providers:[{provide: NG_ASYNC_VALIDATORS, useExisting: UniqueCarGroupNameValidatorDirective, multi: true} ]
// })

// export class UniqueCarGroupNameValidatorDirective implements AsyncValidator {

//   constructor(private carGroupService: CarGroupService) { }

// validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>{
//     return uniqueCarGroupNameValidator(this.carGroupService)(c);
// }
// }
