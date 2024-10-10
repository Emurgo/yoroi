import {Portfolio} from '@yoroi/types'

export function isNft(tokenInfo: Portfolio.Token.Info) {
  return tokenInfo.type === Portfolio.Token.Type.NFT
}
