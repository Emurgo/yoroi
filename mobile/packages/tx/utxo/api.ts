import {BlockHash} from '@yoroi/types'

import {
  TipStatusReference,
  Utxo,
  UtxoApiResponse,
  UtxoAtPointRequest,
  UtxoDiff,
  UtxoDiffSincePointRequest,
} from './models'

export type UtxoApiContract = {
  getBestBlock(): Promise<BlockHash>
  getSafeBlock(): Promise<BlockHash>
  getTipStatusWithReference(
    bestBlocks: BlockHash[],
  ): Promise<UtxoApiResponse<TipStatusReference>>
  getUtxoAtPoint(req: UtxoAtPointRequest): Promise<UtxoApiResponse<Utxo[]>>
  getUtxoDiffSincePoint(
    req: UtxoDiffSincePointRequest,
  ): Promise<UtxoApiResponse<UtxoDiff>>
}
