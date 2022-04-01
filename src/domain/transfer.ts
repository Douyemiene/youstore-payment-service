export enum Status {
    PENDING = "Pending",
    SUCCESS = "Success",
    FAILURE = "Failure",
  }
  
  export interface ITransferProps {

    status: Status;
    amount: number;
    customerId: String
  }
  
  export class Transfer {
    readonly props: ITransferProps;
  
    private constructor(props: ITransferProps) {
      this.props = props;
    }
  
    public static create(props: ITransferProps): Transfer {
      return new Transfer(props);
    }
  }
  