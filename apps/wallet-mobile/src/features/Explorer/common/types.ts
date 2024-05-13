import {Portfolio} from '@yoroi/types'

export enum Explorers {
  CardanoScan = 'cardanoscan',
  CExplorer = 'cexplorer',
}

export type ExplorerManager = Readonly<{
  token: (fingerprint: Portfolio.Token.Info['fingerprint']) => string
}>
