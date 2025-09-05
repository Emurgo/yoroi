import {Datum as DatumType} from '@emurgo/yoroi-lib'

import {PortfolioTokenAmount} from '../portfolio/amount'
import {PortfolioTokenId} from '../portfolio/token'
import {ResolverReceiver} from '../resolver/receiver'

export type TransferAddress = string

export type TransferEntry = {
  address: TransferAddress
  amounts: Record<PortfolioTokenId, PortfolioTokenAmount>
  datum?: DatumType
}

export type TransferTarget = {
  receiver: ResolverReceiver
  entry: TransferEntry
}

export type TransferTargets = Array<TransferTarget>
