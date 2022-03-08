export enum Status {
  PENDING = "Pending",
  SUCCESS = "Success",
  FAILURE = "Failure",
}

export interface IPaymentProps {
  reference: string;
  status: Status;
  amount: number;
}

export class Payment {
  readonly props: IPaymentProps;

  private constructor(props: IPaymentProps) {
    this.props = props;
  }

  public static create(props: IPaymentProps): Payment {
    return new Payment(props);
  }
}
