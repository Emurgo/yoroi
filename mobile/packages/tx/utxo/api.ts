import {
  TipStatusReference,
  Utxo,
  UtxoApiResponse,
  UtxoAtPointRequest,
  UtxoDiff,
  UtxoDiffSincePointRequest
} from './models'

export interface UtxoApiContract {
  getBestBlock(): Promise<string>
  getSafeBlock(): Promise<string>
  getTipStatusWithReference(
    bestBlocks: string[]
  ): Promise<UtxoApiResponse<TipStatusReference>>
  getUtxoAtPoint(req: UtxoAtPointRequest): Promise<UtxoApiResponse<Utxo[]>>
  getUtxoDiffSincePoint(
    req: UtxoDiffSincePointRequest
  ): Promise<UtxoApiResponse<UtxoDiff>>
}

