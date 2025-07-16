import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ShippingCompnanyDto } from './dtos/ShippingCompnanyDto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { DualViewModelDto } from '../../shared/dtos/DualViewModelDto';
import { ProvinceLookup } from '../lookups/province/province-lookup.dialog';
import { CityDto } from '../city/dtos/CityDto';
import { CityLookupComponent } from '../lookups/city/city-lookup.dialog';
import { ProvinceDto } from '../province/dtos/ProvinceDto';
import { BranchDto } from '../branch/dtos/BranchDto';
import { FileDto } from '../../shared/dtos/FileDto';
import { DomSanitizer } from '@angular/platform-browser';
import { ConverterService } from '../../shared/services/converter-service';
import { FileExtensionService } from '../../shared/services/file-extension-service';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: "shipping-compnany-component",
  templateUrl: './shipping-company.component.html',
  styles: [
    '.imagePlaceHolder {border:1px solid pink;width: 220px;Hight: 220px;float: left;margin: 3px;padding: 3px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ],
  providers: [HttpClient]
})
export class ShippingCompanyComponent {
  selectedFile: File;
  reader = new FileReader();
  localUrl: any;
  image: FileDto;
  ShippingCompany = new ShippingCompnanyDto(null);
  Branch = new BranchDto(null);

  provinces = [];
  provinceControl = new FormControl();
  provinceFilterOptions: Observable<CityDto[]>;
  provinceDto = new DualViewModelDto();

  cities = [];
  cityControl = new FormControl();
  cityFilterOptions: Observable<CityDto[]>;
  cityDto = new DualViewModelDto();

  notSelectedProvince = true;
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private _sanitizer: DomSanitizer
  ) {
    this.fillAllProvince();
    this.getShippingCo();
  }

  ngOnInit() {
    this.provinceFilterOptions = this.provinceControl.valueChanges.pipe(
      startWith<string | ProvinceDto>(''),
      map(value => (typeof value === 'string' ? value : value.name)),
      map(name => (name ? this.filterProvince(name) : this.provinces.slice()))
    );
  }
  getLogo(id: number): void {
    let url = '/v1/api/ShippingCompany/' + id + '/image';
    this.http.get(url).subscribe(result => {
      if (result['content'] === null || result['content'] === '') { return; }
      this.localUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
        'data:' + result['contentType'] + ';base64,' + result['content']
      );

      this.image = new FileDto();
      this.image.Content = result['content'];
      this.image.ContentType = result['contentType'];
      this.image.FileName = result['fileName'];
    });
  }
  filterCity(name: string): CityDto[] {
    return this.cities.filter(
      option =>
        option.entity.name.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }
  filterProvince(name: string): ProvinceDto[] {
    return this.provinces.filter(
      option =>
        option.entity.name.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }

  fixAutoRelationalFields(type: string): void {
    if (type == 'province') {
      if (
        this.ShippingCompany.province == null ||
        this.ShippingCompany.province == undefined
      ) {
        this.provinceDto.title = '';
      } else if (
        this.provinceDto.title != this.ShippingCompany.province.title &&
        this.provinceDto.id == this.ShippingCompany.province.id
      ) {
        this.ShippingCompany.province = null;
        this.provinceDto.title = '';
        this.cityDto.title = '';
      }
    }

    if (type == 'city') {
      if (
        this.ShippingCompany.city == null ||
        this.ShippingCompany.city == undefined
      ) {
        this.cityDto.title = '';
      } else if (
        this.cityDto.title != this.ShippingCompany.city.title &&
        this.cityDto.id == this.ShippingCompany.city.id
      ) {
        this.ShippingCompany.province = null;
        this.cityDto.title = '';
      }
    }
  }

  onCitySelectionChange(event, city: CityDto): void {
    if (event && !event.isUserInput) { return; }
    this.ShippingCompany.city = new DualViewModelDto(city.id, city.name);
    this.cityDto.title = this.ShippingCompany.city.title;
    this.cityDto.id = this.ShippingCompany.city.id;
  }
  onProvinceSelectionChange(event, province: ProvinceDto): void {
    if (event && !event.isUserInput) { return; }
    this.ShippingCompany.province = new DualViewModelDto(
      province.id,
      province.name
    );
    this.provinceDto.title = this.ShippingCompany.province.title;
    this.provinceDto.id = this.ShippingCompany.province.id;
    this.cityDto.title = '';
    this.onChangeProvince(this.provinceDto.id);
  }
  fillAllProvince(): void {
    this.http.get('/v1/api/GIS/Province').subscribe(result => {
      this.provinces = result['entityLinkModels'];
    });
  }

  onChangeProvince(provinceId) {
    this.notSelectedProvince = provinceId == undefined || provinceId <= 0;
    if (this.notSelectedProvince) { return; }

    this.http
      .get('/v1/api/GIS/Province/' + provinceId + '/Cities')
      .subscribe(result => {
        this.cities = result['entityLinkModels'];
        this.cityFilterOptions = this.cityControl.valueChanges.pipe(
          startWith<string | CityDto>(''),
          map(value => (typeof value === 'string' ? value : value.name)),
          map(name => (name ? this.filterCity(name) : this.cities.slice()))
        );
      });
  }
  getShippingCo() {
    this.http.get(this.getUrl()).subscribe(result => {
      const EntityLinkModel = result['entityLinkModels'];
      if (EntityLinkModel != null && result['entityLinkModels'][0] != null) {
        {
          this.Branch = result['entityLinkModels'][0].entity.branch;
          this.ShippingCompany = new ShippingCompnanyDto(
            result['entityLinkModels'][0].entity
          );
          this.getLogo(this.ShippingCompany.id);
          let province = new CityDto(null);
          province.id = this.ShippingCompany.province.id;
          province.name = this.ShippingCompany.province.title;

          this.onProvinceSelectionChange(
            {
              isUserInput: true
            },
            province
          );

          this.cityDto = new DualViewModelDto(
            this.ShippingCompany.city ? this.ShippingCompany.city.id : null,
            this.ShippingCompany.city ? this.ShippingCompany.city.title : ''
          );
        }
      } else { this.ShippingCompany = new ShippingCompnanyDto(null); }
    });
  }

  onSubmit(isValidForm): void {
    if (!isValidForm) { return; }
    let data = JSON.stringify({
      Name: this.ShippingCompany.name,
      EconomicCode: this.ShippingCompany.economicCode,
      Manager: this.ShippingCompany.manager,
      City: this.ShippingCompany.city.id,
      Address: this.ShippingCompany.address,
      Phone: this.ShippingCompany.phone,
      Fax: this.ShippingCompany.fax,
      Logo: this.createImageDto()
    });

    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (this.ShippingCompany.id != null) {
      this.http
        .put(this.getUrl() + this.ShippingCompany.id, data, {
          headers: headers1
        })
        .subscribe(result => {
          this.getShippingCo();
        });
    } else {
      this.http
        .post(this.getUrl(), data, { headers: headers1 })
        .subscribe(result => {
          this.getShippingCo();
        });
    }
  }

  onProvinceLookup(): void {
    const dialogRef = this.dialog.open(ProvinceLookup, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب استان',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        let province = new CityDto(null);
        province.id = result.data.selectedItem.id;
        province.name = result.data.selectedItem.name;

        this.onProvinceSelectionChange(
          {
            isUserInput: true
          },
          province
        );
      }
    });
  }

  onCityLookup(): void {
    if (this.provinceDto == null || this.provinceDto == undefined) { return; }

    const dialogRef = this.dialog.open(CityLookupComponent, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        provinceId: this.provinceDto.id,
        dialogTitle: 'انتخاب شهر',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        let city = new CityDto(null);
        city.id = result.data.selectedItem.id;
        city.name = result.data.selectedItem.name;

        this.onCitySelectionChange(
          {
            isUserInput: true
          },
          city
        );
      }
    });
  }
  createImageDto(): FileDto {
    const image: FileDto = new FileDto();
    if (this.reader == null || this.reader.result == null) { return this.image; }

    image.Content = typeof this.reader.result === 'string' ? this.reader.result.split(',') : [1];
    image.FileName = this.selectedFile.name;
    image.ContentType = this.selectedFile.type;
    return image;
  }
  showPreviewLogo(event: any) {
    if (event.target.files && event.target.files[0]) {
      let fileSize = ConverterService.ByteToMegaByte(
        event.target.files[0].size
      );
      if (fileSize > 2) {
        this.snackBar.open(
          'حجم فایل نمی تواند بیشستر از 2 مگابایت باشد- حجم فایل = ' +
          fileSize +
          ' مگابایت.',
          'خطا',
          {
            duration: 3000,
            panelClass: ['snack-bar-info']
          }
        );
        return;
      }
      let isValidFormat = FileExtensionService.IsValidImageFormatByFileName(
        event.target.files[0].name
      );
      if (!isValidFormat) {
        this.snackBar.open(
          'فایل باید حتما تصویر با پسوند jpg یا png باشد',
          'خطا',
          {
            duration: 3000,
            panelClass: ['snack-bar-info']
          }
        );
        return;
      }

      this.reader.onload = (event: any) => {
        this.localUrl = event.target.result;
      };
      this.reader.readAsDataURL(event.target.files[0]);
      this.selectedFile = event.target.files[0];
      this.image = null;
    }
  }
  onDeleteLogo() {
    this.image = new FileDto();
    this.reader = new FileReader();
    this.localUrl = null;
  }
  getUrl() {
    return '/v1/api/ShippingCompany/';
  }
}
