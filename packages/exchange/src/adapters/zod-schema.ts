import {z} from 'zod'
import {isOrderType} from '../helpers/order-types'
import {isFiatType} from '../helpers/fiat-types'
import {isCoinType} from '../helpers/coin-types'
import {isBlockchainCode} from '../helpers/blockchain-code'
import {isPossibleCardanoAddress} from '../helpers/wallet-address'

export const urlReferralQueryStringParamsSchema = z
  .object({
    orderType: z.string().refine(isOrderType).optional(),
    fiatType: z.string().refine(isFiatType),
    fiatAmount: z.number().optional(),
    coinType: z.string().refine(isCoinType),
    coinAmount: z.number().optional(),
    blockchain: z.string().refine(isBlockchainCode).optional(),
    walletAddress: z.string(),
    returnUrl: z.string().optional(),
  })
  .refine((data) => {
    return (
      (data.coinType === 'ADA' || data.coinType === 'TADA') &&
      isPossibleCardanoAddress(data.walletAddress)
    )
  })
