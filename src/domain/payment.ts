export interface IPaymentProps {
  reference: string;
  status: boolean | null;
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
