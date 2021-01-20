// @flow
import {MultiToken} from './MultiToken'

export interface ISignRequest<T> {
  totalInput(shift: boolean): Promise<MultiToken>;
  totalOutput(shift: boolean): Promise<MultiToken>;
  fee(): Promise<MultiToken>;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Promise<Array<string>>;
  isEqual(tx: ?mixed): Promise<boolean>;

  self(): T;
}
