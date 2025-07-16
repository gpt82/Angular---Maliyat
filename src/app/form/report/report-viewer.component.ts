import { Component, Inject } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { ReportService } from '../../shared/services/report-service';

declare var Stimulsoft: any;
@Component({
  selector: 'app-root',
  template: `<div>
                  <mat-toolbar color="primary" class="main-content-toolbar app-actionbar">
                    <div class="grid-alert grid-alert-info" role="alert">
                      <strong>{{reportTitle}}</strong>
                    </div>
                  </mat-toolbar>
                  <div id="viewerContent" style="direction:ltr"></div>
            </div>`,
  encapsulation: ViewEncapsulation.None
})

export class ReportViewerComponent {

  reportViewModel = ReportService.reportViewModel;
  reportTitle = this.reportViewModel.reportTitle;
  viewer: any = new Stimulsoft.Viewer.StiViewer(this.reportViewModel.options, 'StiViewer', false);

  ngOnInit() {
    var report = new Stimulsoft.Report.StiReport();
    report.loadFile("./assets/reports/" + this.reportViewModel.reportName);

    var dataSet = new Stimulsoft.System.Data.DataSet();
    dataSet.readJson(this.reportViewModel.dataSources);

    report.dictionary.databases.clear();
    report.regData("Demo", "Demo", dataSet);
    report.render();

    this.viewer.report = report;
    this.viewer.renderHtml("viewerContent");
  }

  constructor() { }
}