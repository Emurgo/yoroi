import {Portfolio} from '@yoroi/types'

import {ReactNode} from 'react'

export type OperationContext =
  | 'send'
  | 'delegate'
  | 'governance'
  | 'swap'
  | 'claim'
  | 'exchange'
  | 'withdraw'
  | 'utxo-consolidation'
  | 'default'

export type ResultScreenType = 'success' | 'error'

export type ResultAction = {
  title: string
  onPress: () => void
}

export type ResultMetadata = {
  txHash?: string
  txId?: string
  amounts?: ReadonlyArray<Portfolio.Token.Amount>
  [key: string]: unknown
}

export type ResultScreenParams = {
  type: ResultScreenType
  context?: OperationContext
  title?: string
  message?: string
  icon?: ReactNode
  primaryAction?: ResultAction
  secondaryAction?: ResultAction
  metadata?: ResultMetadata
  customContent?: ReactNode
}

export type ResultScreenConfig = {
  defaultTitle: string
  defaultMessage: string
  defaultIcon?: ReactNode
  defaultPrimaryAction?: ResultAction
  defaultSecondaryAction?: ResultAction
}
