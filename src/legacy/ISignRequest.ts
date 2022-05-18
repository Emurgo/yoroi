import {MultiToken} from '../yoroi-wallets'

export interface ISignRequest<T = unknown> {
  fee(): Promise<MultiToken>
  self(): T
}
