import {z} from 'zod'

import {banxaIsCoinType} from '../../helpers/banxa/coin-types'
import {banxaIsFiatType} from '../../helpers/banxa/fiat-types'
import {banxaIsPossibleCardanoAddress} from '../../helpers/banxa/wallet-address'
import {banxaIsBlockchainCode} from '../../helpers/banxa/blockchain-code'
import {banxaIsOrderType} from '../../helpers/banxa/order-types'
import {banxaIsTheme} from '../../helpers/banxa/theme'

export const BanxaUrlReferralQueryStringParamsSchema = z
  .object({
    orderType: z.string().refine(banxaIsOrderType).optional(),
    fiatType: z.string().refine(banxaIsFiatType),
    fiatAmount: z.number().optional(),
    coinType: z.string().refine(banxaIsCoinType),
    coinAmount: z.number().optional(),
    blockchain: z.string().refine(banxaIsBlockchainCode).optional(),
    walletAddress: z.string(),
    walletAddressTag: z.string().optional(),
    backgroundColor: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    textColor: z.string().optional(),
    theme: z.string().refine(banxaIsTheme).optional(),
    returnUrl: z.string().optional(),
  })
  .refine((data) => {
    return (
      (data.coinType === 'ADA' || data.coinType === 'TADA') &&
      banxaIsPossibleCardanoAddress(data.walletAddress)
    )
  })
