// @flow
import {BigNumber} from 'bignumber.js'

// TODO: we should remove this after we have real wallet type
export type Wallet = {
  id: string,
  name: string,
  balance: BigNumber,
}
