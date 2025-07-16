import { Component } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpHeaders } from '@angular/common/http'

@Component({
  selector: 'upload-component',
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  public progress: number;
  public message: string;
  constructor(private http: HttpClient) { }

  upload(files): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (files.length === 0)
    return;

  const formData = new FormData();

  for (let file of files)
    formData.append(file.name, file);

    this.http
      .post(
        '/api/upload',
        formData,
        // { headers: headers1 }
      )
      .subscribe(
        result => {
         
        },
        (error: any) => {
          console.log('create softe');
          console.log(error);
        }
      );
  }
  upload1(files) {
    if (files.length === 0)
      return;

    const formData = new FormData();

    for (let file of files)
      formData.append(file.name, file);

    const uploadReq = new HttpRequest('POST', `v1/api/upload`, formData, {
      reportProgress: true,
    }); // this.http.request(uploadReq)
    this.http.post('api/upload', formData)
    .subscribe(event => {
    //   if (event.type === HttpEventType.UploadProgress)
    //     this.progress = Math.round(100 * event.loaded / event.total);
    //   else if (event.type === HttpEventType.Response)
    //     this.message = event.body.toString();
    });
  }
}