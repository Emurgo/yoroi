import {z} from 'zod'

import {banxaIsCoinType} from '../helpers/coin-types'
import {banxaIsFiatType} from '../helpers/fiat-types'
import {banxaIsPossibleCardanoAddress} from '../helpers/wallet-address'
import {banxaIsBlockchainCode} from '../helpers/blockchain-code'

export const BanxaUrlReferralQueryStringParamsSchema = z
  .object({
    sellMode: z.boolean().optional(),
    fiatType: z.string().refine(banxaIsFiatType),
    fiatAmount: z.number().optional(),
    coinType: z.string().refine(banxaIsCoinType),
    coinAmount: z.number().optional(),
    blockchain: z.string().refine(banxaIsBlockchainCode).optional(),
    walletAddress: z.string(),
    walletAddressTag: z.string().optional(),
  })
  .refine((data) => {
    return (
      (data.coinType === 'ADA' || data.coinType === 'TADA') &&
      banxaIsPossibleCardanoAddress(data.walletAddress)
    )
  })
