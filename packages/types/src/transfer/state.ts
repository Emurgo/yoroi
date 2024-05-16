import {Datum as DatumType} from '@emurgo/yoroi-lib'
import {BalanceAmounts} from '../balance/token'
import {ResolverReceiver} from '../resolver/receiver'

export type TransferAddress = string

export type TransferEntry = {
  address: TransferAddress
  amounts: BalanceAmounts
  datum?: DatumType
}

export type TransferTarget = {
  receiver: ResolverReceiver
  entry: TransferEntry
}

export type TransferTargets = Array<TransferTarget>
