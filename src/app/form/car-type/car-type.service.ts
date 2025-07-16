import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class CarTypeService {
  private url ='/v1/api/CarType';

  constructor(private http: HttpClient){}

  getCarTypeByName(name: string){
    return this.http.get<any>(`${this.url}/Name/${name}`);
  }

  getCarTypeByCode(code: string){
    return this.http.get<any>(`${this.url}/Code/${code}`);
  }
}

