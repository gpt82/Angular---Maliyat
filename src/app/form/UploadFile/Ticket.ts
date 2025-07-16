export class Ticket {
  // constructor(public description: string = "") {}
  constructor(viewModel = null) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.tableId = viewModel.tableId;
      this.tableName = viewModel.tableName;
      this.description = viewModel.description;
    }
  }

  id: number;
  tableId: number;
  tableName: string;
  description: number;
}
