import {z} from 'zod'
import {isOrderType} from '../validators/order-types'
import {isFiatType} from '../validators/fiat-types'
import {isCoinType} from '../validators/coin-types'
import {isBlockchainCode} from '../validators/blockchain-code'
import {isPossibleCardanoAddress} from '../validators/wallet-address'

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
    access_token: z.string().optional(),
    balance: z.string().optional(),
  })
  .refine((data) => {
    return (
      data.coinType === 'ADA' && isPossibleCardanoAddress(data.walletAddress)
    )
  })
