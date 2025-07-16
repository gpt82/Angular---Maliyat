import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AutoPartsService {
  private url = '/v1/api/Packaging/';
  // private data: any[] = products;
  // private counter: number = products.length;
  constructor(private http: HttpClient) {
  }
  getPackaging() {
    return this.http.get<any>('/v1/api/Packaging');
  }
  getLoadingLocations() {
    return this.http.get<any>('/v1/api/loadingLocations');
  }

  // public remove(autoParts: any): void {
  //     const index = this.data.findIndex(({ ProductID }) => ProductID === product.ProductID);
  //     this.data.splice(index, 1);
  // }

  // public save(product: any, isNew: boolean): void {
  //     if (isNew) {
  //         product.ProductID = this.counter++;
  //         this.data.splice(0, 0, product);
  //     } else {
  //         Object.assign(
  //             this.data.find(({ ProductID }) => ProductID === product.ProductID),
  //             product
  //         );
  //     }
  // }
}
