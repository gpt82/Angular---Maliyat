import { Injectable } from '@angular/core';

@Injectable()
export class ReportService {
  static reportViewModel: ReportViewModel;
  static setReportViewModel(viewModel: ReportViewModel): any {
    this.reportViewModel = viewModel;
  }
}

export class ReportViewModel {
  reportName: string;
  options: any;
  reportTitle: string;
  dataSources: any;
}
