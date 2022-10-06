import {MultiToken} from '../yoroi-wallets'

export interface ISignRequest<T = unknown> {
  totalInput(shift: boolean): Promise<MultiToken>
  totalOutput(shift: boolean): Promise<MultiToken>
  fee(): Promise<MultiToken>
  uniqueSenderAddresses(): Array<string>
  receivers(includeChange: boolean): Promise<Array<string>>
  isEqual(tx: unknown | null | undefined): Promise<boolean>
  self(): T
}
