import {Datum as DatumType} from '@yoroi/tx'

import {Address} from '../branded'
import {PortfolioTokenAmount} from '../portfolio/amount'
import {PortfolioTokenId} from '../portfolio/token'
import {ResolverReceiver} from '../resolver/receiver'

export type TransferAddress = Address

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
