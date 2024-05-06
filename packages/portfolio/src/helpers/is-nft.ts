import {Portfolio} from '@yoroi/types'

export const isNft = (tokenInfo: Portfolio.Token.Info): boolean =>
  tokenInfo.type === Portfolio.Token.Type.NFT
