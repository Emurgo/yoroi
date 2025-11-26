import {chunk, flatten} from '@yoroi/common'

import axios from 'axios'
import BigNumber from 'bignumber.js'

import {UtxoApiContract} from './api'
import {
  Asset,
  DiffType,
  TipStatusReference,
  Utxo,
  UtxoApiResponse,
  UtxoApiResult,
  UtxoAtPointRequest,
  UtxoDiff,
  UtxoDiffItem,
  UtxoDiffItemOutput,
  UtxoDiffSincePointRequest,
} from './models'

export type UtxoAtPointItemResponse = {
  utxo_id: string
  tx_hash: string
  tx_index: number
  receiver: string
  amount: string
  assets: Asset[]
  block_num: number
}

export type UtxoDiffSincePointItemResponse = {
  type: DiffType
  id: string
  receiver: string
  amount: string
  assets: Asset[]
  block_num: number
  tx_hash: string
  tx_index: number
}

export type UtxoDiffSincePointResponse = {
  lastDiffPointSelected: any // opaque type
  diffItems: UtxoDiffSincePointItemResponse[]
  lastFoundSafeblock?: string
  lastFoundBestblock?: string
}

export type TipStatusResponse = {
  reference: {
    lastFoundSafeBlock: string
    lastFoundBestBlock: string
  }
}

export type GetTipStatusResponse = {
  safeBlock: {
    hash: string
  }
  bestBlock: {
    hash: string
  }
}

const handleReferencePointErrors = <T>(err: any): UtxoApiResponse<T> => {
  if (
    err.response &&
    err.response.data &&
    err.response.data.error &&
    err.response.data.error.response
  ) {
    const errResponse: string = err.response.data.error.response
    switch (errResponse) {
      case 'REFERENCE_POINT_BLOCK_NOT_FOUND':
        return {
          result: UtxoApiResult.SAFEBLOCK_ROLLBACK,
        }
      default:
        throw err
    }
  } else {
    throw err
  }
}

const handleReferencePointAndBestBlockErrors = <T>(
  err: any,
): UtxoApiResponse<T> => {
  if (
    err.response &&
    err.response.data &&
    err.response.data.error &&
    err.response.data.error.response
  ) {
    const errResponse: string = err.response.data.error.response
    switch (errResponse) {
      // check BE is not throwing it
      case 'REFERENCE_BESTBLOCK_NOT_FOUND':
        return {
          result: UtxoApiResult.BESTBLOCK_ROLLBACK,
        }
      case 'REFERENCE_POINT_BLOCK_NOT_FOUND':
        return {
          result: UtxoApiResult.SAFEBLOCK_ROLLBACK,
        }
      default:
        throw err
    }
  } else {
    throw err
  }
}

export const createBatchedEmurgoUtxoApi = (
  base: UtxoApiContract,
  maxAddresses = 500,
): UtxoApiContract => {
  return {
    async getSafeBlock(): Promise<string> {
      return await base.getSafeBlock()
    },

    async getBestBlock(): Promise<string> {
      return await base.getBestBlock()
    },

    async getTipStatusWithReference(
      bestBlocks: string[],
    ): Promise<UtxoApiResponse<TipStatusReference>> {
      return await base.getTipStatusWithReference(bestBlocks)
    },

    async getUtxoAtPoint(
      req: UtxoAtPointRequest,
    ): Promise<UtxoApiResponse<Utxo[]>> {
      try {
        const addressChunks = chunk(req.addresses, maxAddresses)
        const promises = addressChunks.map(
          async (addresses) =>
            await base.getUtxoAtPoint({
              referenceBlockHash: req.referenceBlockHash,
              addresses: addresses,
            }),
        )
        const values = (await Promise.all(promises)).map(
          (x) => x.value as Utxo[],
        )
        return {
          result: UtxoApiResult.SUCCESS,
          value: flatten(values),
        }
      } catch (err: any) {
        return handleReferencePointErrors(err)
      }
    },

    async getUtxoDiffSincePoint(
      req: UtxoDiffSincePointRequest,
    ): Promise<UtxoApiResponse<UtxoDiff>> {
      try {
        const addressChunks = chunk(req.addresses, maxAddresses)
        const promises = addressChunks.map(
          async (addresses) =>
            await base.getUtxoDiffSincePoint({
              afterBestBlocks: req.afterBestBlocks,
              untilBlockHash: req.untilBlockHash,
              addresses: addresses,
            }),
        )
        const values = (await Promise.all(promises)).map(
          (x) => x.value as UtxoDiff,
        )
        const uniqueMatchedBestBlocks = new Set(
          values.map((e) => e.reference.lastFoundBestBlock),
        )
        if (uniqueMatchedBestBlocks.size > 1) {
          return {result: UtxoApiResult.BESTBLOCK_ROLLBACK}
        }
        const latestMatchedSafeBlockIndex = Math.max(
          ...values.map((e) => {
            const v = e.reference.lastFoundSafeBlock
            return v == null ? -1 : req.afterBestBlocks.indexOf(v)
          }),
        )
        if (latestMatchedSafeBlockIndex < 0) {
          return {result: UtxoApiResult.SAFEBLOCK_ROLLBACK}
        }
        const firstValue = values[0]
        if (!firstValue) {
          // Fallback if values is empty (shouldn't happen, but TypeScript needs this)
          throw new Error('No values returned from UTXO API')
        }
        return {
          result: UtxoApiResult.SUCCESS,
          value: {
            diffItems: flatten(values.map((x) => x.diffItems)),
            reference: {
              lastFoundBestBlock: firstValue.reference.lastFoundBestBlock,
              lastFoundSafeBlock:
                req.afterBestBlocks[latestMatchedSafeBlockIndex],
            },
          },
        }
      } catch (err: any) {
        return handleReferencePointErrors(err)
      }
    },
  }
}

async function getUtxoAtPointPage(
  apiUrl: string,
  pageSize: number,
  req: UtxoAtPointRequest,
  page: number,
): Promise<UtxoAtPointItemResponse[]> {
  const url = `${apiUrl}v2/txs/utxoAtPoint`
  const resp = await axios.post<UtxoAtPointItemResponse[]>(url, {
    addresses: req.addresses,
    referenceBlockHash: req.referenceBlockHash,
    page,
    pageSize,
  })
  return resp.data
}

export const createEmurgoUtxoApi = (
  apiUrl: string,
  throwRequestErrors: boolean,
  pageSize = 50,
): UtxoApiContract => {
  return {
    async getSafeBlock(): Promise<string> {
      const url = `${apiUrl}v2/tipStatus`
      const resp = await axios.get<GetTipStatusResponse>(url)
      return resp.data.safeBlock.hash
    },

    async getBestBlock(): Promise<string> {
      const url = `${apiUrl}v2/tipStatus`
      const resp = await axios.get<GetTipStatusResponse>(url)
      return resp.data.bestBlock.hash
    },

    async getTipStatusWithReference(
      bestBlocks: string[],
    ): Promise<UtxoApiResponse<TipStatusReference>> {
      try {
        const url = `${apiUrl}v2/tipStatus`
        const resp = await axios.post<TipStatusResponse>(url, {
          reference: {
            bestBlocks: bestBlocks,
          },
        })
        return {
          result: UtxoApiResult.SUCCESS,
          value: {
            reference: {
              lastFoundBestBlock: resp.data.reference.lastFoundBestBlock,
              lastFoundSafeBlock: resp.data.reference.lastFoundSafeBlock,
            },
          },
        }
      } catch (err: any) {
        if (
          err.response &&
          err.response.data &&
          err.response.data.error &&
          err.response.data.error.response
        ) {
          const errResponse: string = err.response.data.error.response
          switch (errResponse) {
            case 'REFERENCE_POINT_BLOCK_NOT_FOUND':
              return {
                result: UtxoApiResult.SAFEBLOCK_ROLLBACK,
              }
            default:
              throw err
          }
        } else {
          throw err
        }
      }
    },

    async getUtxoAtPoint(
      req: UtxoAtPointRequest,
    ): Promise<UtxoApiResponse<Utxo[]>> {
      try {
        let page = 1

        let allUtxos: UtxoAtPointItemResponse[] = []
        let utxosAtPointPage = await getUtxoAtPointPage(
          apiUrl,
          pageSize,
          req,
          page,
        )
        allUtxos = allUtxos.concat(utxosAtPointPage)

        while (utxosAtPointPage.length === pageSize) {
          page++
          utxosAtPointPage = await getUtxoAtPointPage(
            apiUrl,
            pageSize,
            req,
            page,
          )
          allUtxos = allUtxos.concat(utxosAtPointPage)
        }

        return {
          result: UtxoApiResult.SUCCESS,
          value: allUtxos.map((u) => {
            return {
              utxoId: u.utxo_id,
              amount: new BigNumber(u.amount),
              assets: u.assets,
              blockNum: u.block_num,
              receiver: u.receiver,
              txHash: u.tx_hash,
              txIndex: u.tx_index,
            }
          }),
        }
      } catch (err: any) {
        if (throwRequestErrors) {
          throw err
        }
        return handleReferencePointErrors(err)
      }
    },

    async getUtxoDiffSincePoint(
      req: UtxoDiffSincePointRequest,
    ): Promise<UtxoApiResponse<UtxoDiff>> {
      try {
        const url = `${apiUrl}v2/txs/utxoDiffSincePoint`
        let response = await axios.post<UtxoDiffSincePointResponse>(url, {
          addresses: req.addresses,
          untilBlockHash: req.untilBlockHash,
          afterBestblocks: req.afterBestBlocks,
          diffLimit: pageSize,
        })

        if (response.data.lastFoundBestblock == null) {
          throw new Error(
            'Unexpected state: no bestblock match is found in the request reference!',
          )
        }

        const reference = {
          lastFoundBestBlock: response.data.lastFoundBestblock,
          lastFoundSafeBlock: response.data.lastFoundSafeblock,
        }

        let allDiffItems: UtxoDiffSincePointItemResponse[] = [
          ...response.data.diffItems,
        ]
        while (response.data.diffItems.length === pageSize) {
          response = await axios.post<UtxoDiffSincePointResponse>(url, {
            addresses: req.addresses,
            untilBlockHash: req.untilBlockHash,
            afterPoint: response.data.lastDiffPointSelected,
            diffLimit: pageSize,
          })
          allDiffItems = allDiffItems.concat(response.data.diffItems)
        }

        return {
          result: UtxoApiResult.SUCCESS,
          value: {
            diffItems: allDiffItems.map((u) => {
              if (u.type === DiffType.INPUT) {
                return {
                  amount: new BigNumber(u.amount),
                  id: u.id,
                  type: u.type,
                } as UtxoDiffItem
              } else {
                return {
                  amount: new BigNumber(u.amount),
                  id: u.id,
                  type: u.type,
                  utxo: {
                    amount: new BigNumber(u.amount),
                    assets: u.assets,
                    blockNum: u.block_num,
                    receiver: u.receiver,
                    txHash: u.tx_hash,
                    txIndex: u.tx_index,
                    utxoId: u.id,
                  },
                } as UtxoDiffItemOutput
              }
            }),
            reference: reference,
          },
        }
      } catch (err: any) {
        if (throwRequestErrors) {
          throw err
        }
        return handleReferencePointAndBestBlockErrors(err)
      }
    },
  }
}
