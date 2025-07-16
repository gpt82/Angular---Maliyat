import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  constructor(translate: TranslateService, private httpClient: HttpClient) {
    translate.setDefaultLang('fa');

    translate.use('fa');
  }

  ngOnInit() {}
}
