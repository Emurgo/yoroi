// @flow
import {BigNumber} from 'bignumber.js'

import type {BaseSignRequest} from './types'

export interface ISignRequest<T> {
  totalInput(shift: boolean): Promise<BigNumber>;
  totalOutput(shift: boolean): Promise<BigNumber>;
  fee(shift: boolean): Promise<BigNumber>;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Promise<Array<string>>;
  isEqual(tx: ?mixed): Promise<boolean>;

  self(): BaseSignRequest<T>;
}
