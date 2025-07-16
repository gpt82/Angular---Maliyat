import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import { CarDetailDto } from "./dtos/CarDetailDto";
import { Observable } from "rxjs";


@Injectable()
export class CarService {
  private url ='/v1/api/Car';

  constructor(private http: HttpClient){}

  getCarById(id: number): Observable<CarDetailDto>{
    return this.http.get<CarDetailDto>(`${this.url}/${id}/single`);
  }
}
