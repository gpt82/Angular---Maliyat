export class ImportExcelModel {
    public WaybillNumber: string;
    public WaybillSeries: string;
    public FareContract: string;
    public CargoCode: string;
    public ExportDate: Date;
    public PayTypeId: string;
    public Sender: string;
    public LoadingLocation: string;
    public Receiver: string;
    public TargetBranch: string;
    public DriverSmart: string;
    public TrailerSmart: string;
    public CarCount: number | null;
    public LttrNo: string;
    public Fare: number;
    public Reward: number;
    public PreFare: number;
    public MilkRun: number;
    public MilkRunCount: number;
    public RemainingFare: number;
    public Description: string;
    public TransTime: number | null;
  }
  