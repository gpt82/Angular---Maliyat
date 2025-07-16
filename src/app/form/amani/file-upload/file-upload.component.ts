import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FileUploader, FileLikeObject, FileItem } from 'ng2-file-upload';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/app-auth-n.service';
import { TokenNameConstants } from '../../../shared/constants/constants';
// import { environment } from '../../../environments/environment';



interface responseType {
    succeeded: boolean;
    fileName: string;
    message: string;
    photos: photoModel[];
    images: string[];

}

interface photoModel {
    name: string;
    absolutePath: string;
    relativePath: string;
    created: string;
    modified: string;
    size: number;
    directoryName: string;
    isDeleted: boolean;
}
@Component({
    selector: 'app-file-upload-input',
    templateUrl: './file-upload.component.html',
    // styleUrls: ['./file-upload.component.scss']
})
export class FileUploadInputComponent implements OnInit {
    public uploader: FileUploader;
    @Input('img') img: string;
    @Input('uploaderName') uploaderName = '';
    @Input('uploaderUrl') uploaderUrl = 'api/services/app/UploadService/Upload';
    @Output('onComplate') onComplate = new EventEmitter<any>();
    @Input('id') id = '';
    @Input('uploaderType') uploaderType = '';
    @Input('theme') theme = '';
    @Input('temp') temp: boolean;
    @Input('imageList') imageList: any[] = [];
    @Input('imageNameList') imageNameList: any[] = [];
    @Input('maxCount') maxCount = 3;
    @Input('allowEdit') allowEdit = true;
    @Input('deleteOldFiles') deleteOldFiles = true;
    @Input('ownerId') ownerId = '';
    @Input('type') type = '';
    @Input('showProgress') showProgress = false;
    


    url: string;
    urlDelete: string;
    @Input('maxFileSize') maxFileSize: number = 1 * 1024 * 1024; //1MB
    @Input('fileTypes') fileTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];
    acceptedFileType: string;
    authToken: string;
    imagePath = "";

    @ViewChild('fileUpload', { static: true }) fileUpload: ElementRef;
    
    constructor(
        private toastrService: ToastrService,
        public authService: AuthService


    ) {
        this.authToken =   localStorage.getItem(TokenNameConstants.accessTokenKey);//'Bearer ' + this.authService.currentUserValue.token;
    }



    ngOnInit() {
        // if (!this.img)
        //     this.img = '/assets/images/avatar/images.png';
     this.url ='http://localhost:5002/v1/api/Uploader';
        // if (this.type == 'save')
        //     this.url = environment.ServerApis.uploadSaveUrl;

        this.uploader = new FileUploader({
            autoUpload: true,
            itemAlias: "file",
            removeAfterUpload: true,
            method: 'POST',
            url: this.url,
            allowedMimeType: this.fileTypes,
            maxFileSize: this.maxFileSize,
            authToken: this.authToken,
            headers: [{ name: 'Access-Control-Allow-Credentials', value: 'true' }]


        });
        this.acceptedFileType = this.fileTypes.toString();



        //---------------------------------------------------------------------------------

        this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
            // debugger;
            switch (filter.name) {
                case 'fileSize':
                    this.toastrService.warning('حجم فایل بیش از 5 مگابایت است.', item.name);
                    break;
                case 'mimeType':
                    const allowedTypes = this.uploader.options.allowedMimeType.join();
                    this.toastrService.warning(`فایل "${item.type} مجاز نیست. ` + `فایل های مجاز:${allowedTypes}"`, item.name);
                    break;
                default:
                    this.toastrService.warning(`خطا در افزودن فایل `, item.name);
            }
        }

        //---------------------------------------------------------------------------------

        this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
            // debugger;
            switch (filter.name) {
                case 'fileSize':
                    this.toastrService.warning('حجم فایل بیش از یک مگابایت است.', item.name);
                    break;
                case 'mimeType':
                    const allowedTypes = this.uploader.options.allowedMimeType.join();
                    this.toastrService.warning(`فایل "${item.type} مجاز نیست. ` + `فایل های مجاز:${allowedTypes}"`, item.name);
                    break;
                default:
                    this.toastrService.warning(`خطا در افزودن فایل `, item.name);
            }
        }

        //---------------------------------------------------------------------------------
        this.uploader.onBuildItemForm = (item, form: FormData) => {
            //form.append('file', value.file, value.FileName);
            form.append('type', this.uploaderType);
            form.append('ownerId', this.ownerId);
        };
        //---------------------------------------------------------------------------------
        this.uploader.onCompleteItem = ((item: FileItem, response: any, status: number, header: any) => {
            var r: responseType = JSON.parse(response);
            // debugger;
            if (r.succeeded == true) {
                this.toastrService.success('بارگذاری فایل با موفقیت انجام شد.');
                this.imageNameList.push(r);

            } else {
                item.isUploaded = false;
                this.toastrService.error('متاسفانه بارگذاری فایل با خطا مواجه شد!');
            }
            this.onComplate.emit(this.imageNameList);
            this.fileUpload.nativeElement.value = '';
        });
        //---------------------------------------------------------------------------------
        this.uploader.onErrorItem = ((item: FileItem, response: any, status: number, header: any) => {
            item.isUploaded = false;
            this.toastrService.error('متاسفانه بارگذاری فایل با خطا مواجه شد!');
        });
        //---------------------------------------------------------------------------------
        this.uploader.onAfterAddingFile = ((item: FileItem) => {

        });

    }


    upload() {
        if (this.imageNameList.length >= this.maxCount) {
            this.toastrService.warning('حداکثر: ' + this.maxCount + ' فایل می توانید آپلود کنید.');
        } else {
            this.fileUpload.nativeElement.click();
        }
    }

    fileChange(event) {
        //let fileList: FileList = event.target.files;
        //if (fileList.length > 0) {
        //  let file: File = fileList[0];
        //  var img: any = document.querySelector("#preview img");
        //  if (!img)
        //    return;
        //  img.file = file;
        //  var reader = new FileReader();
        //  reader.onload = ((aImg) => {
        //    return (e) => {
        //      aImg.src = e.target.result;
        //    };
        //  })(img);
        //  reader.readAsDataURL(file);
        //}
    }


    /**
     * حذف قایل
     * @param item
     */
    deleteFile(item: photoModel) {
        //Swal.fire({
        //  title: 'آیا می خواهید این تصویر را حذف کنید؟',
        //  icon: 'question',
        //  customClass: {
        //    container: "custom-swal farsi-question"
        //  },
        //  confirmButtonText: 'بله',
        //  cancelButtonText: 'خیر',
        //  showCancelButton: true,
        //  showCloseButton: true,
        //}).then(result => {
        //  if (result.value == true) {



        //    this.publicService.deleteEmployerRequestImage({ path: item.absolutePath }, this.urlDelete).subscribe(response => {
        //      if (response.result == true) {
        //        this.toastrService.success('حذف فایل با موفقیت انجام شد.');
        //        this.imageList.forEach((i, index) => {
        //          if (i.relativePath == item.relativePath)
        //            this.imageList.splice(index, 1);
        //        });
        //      } else {
        //        this.toastrService.error('متاسفانه حذف فایل با خطا مواجه شد!');
        //      }
        //    }, (error) => {
        //      this.toastrService.error('متاسفانه حذف فایل با خطا مواجه شد!');
        //    });



        //  }
        //});
    }


    /**
     * مشاهده فایل
     * @param item
     */
    viewFile(item: photoModel) {
        window.open(this.imagePath + item.relativePath);
    }


}

