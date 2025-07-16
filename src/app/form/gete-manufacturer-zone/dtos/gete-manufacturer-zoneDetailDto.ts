export class GeteManufacturerZoneDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel != undefined) {
      this.id = viewModel.id;
      this.geteManufacturerId = viewModel.geteManufacturerId;
      this.geteManufacturerName = viewModel.geteManufacturerName;
      this.geteLoadingLocationId = viewModel.geteLoadingLocationId;
      this.geteLoadingLocationName = viewModel.geteLoadingLocationName;
      this.geteZoneId = viewModel.geteZoneId;
      this.geteZoneName = viewModel.geteZoneName;
    }
  }
  id: number;
  geteManufacturerId: number;
  geteManufacturerName: string;
  geteLoadingLocationId: number;
  geteLoadingLocationName: string;
  geteZoneId: number;
  geteZoneName: string;
}
