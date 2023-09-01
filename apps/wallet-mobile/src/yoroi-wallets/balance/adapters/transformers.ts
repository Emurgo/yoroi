import {Balance} from '@yoroi/types'
import {Cardano, isArrayOfType, isString, parseNumber, parseString} from '@yoroi/wallets'

import {ApiFutureToken, ApiNftMetadata, ApiTokenId} from './api/types'

export function asApiTokenId(tokenId: string): ApiTokenId {
  if (tokenId.includes('.')) {
    return tokenId as ApiTokenId
  }
  return `${tokenId}.`
}

export const asBalanceTokens = ([tokenId, metadata]: [
  tokenId: Balance.Token['info']['id'],
  tokenRecords: ApiFutureToken,
]): ReadonlyArray<Balance.TokenInfo> => {
  const [policyId, assetNameHex] = tokenId.split('.')
  const assetNameUtf8 = Buffer.from(assetNameHex ?? '', 'hex').toString('utf8')
  console.log('assetNameUtf8', assetNameUtf8)
  console.log('metadata', metadata)
  console.log('policyId', policyId)

  // if (metadata.onChain.isValidNft) {
  // const nftRecord = mintNftAsBalanceTokenInfo({
  //   tokenId,
  //   policyId,
  //   assetNameUtf8,
  //   // metadata: metadata.onChain.mintNft.metadata,
  // })
  // console.log(nftRecord)
  // }

  return []
}

export const mintNftAsBalanceTokenInfo = ({
  tokenId,
  metadata,
  policyId,
  assetNameUtf8,
}: {
  tokenId: Balance.Token['info']['id']
  policyId: string
  assetNameUtf8: string
  metadata: ApiNftMetadata
}): Readonly<Omit<Balance.TokenInfo, 'metadatas'>> => {
  // Nft
  const id = tokenId
  const fingerprint = Cardano.asFingerprint(tokenId)
  const group = policyId
  const name = asString(metadata.name) ?? assetNameUtf8
  const ticker = parseString(metadata?.ticker) ?? assetNameUtf8 // nft ticker = asset name utf8
  const description = asString(metadata?.description) ?? ''

  const metadataImage = asString(metadata.image) ?? ''
  const isIpfsImage = metadataImage.startsWith('ipfs://')
  const image = isIpfsImage ? metadataImage?.replace('ipfs://', `https://ipfs.io/ipfs/`) : metadataImage
  const icon = image
  const mediaType = asString(metadata?.mediaType) ?? null

  // Not Nft but we handle if provided
  const symbol = parseString(metadata?.symbol) ?? ''

  const parsedDecimals = parseNumber(metadata?.decimals)
  const decimals = parsedDecimals ?? null

  return {
    kind: 'nft',
    id,
    fingerprint,
    name,
    description,
    group,
    decimals,
    ticker,
    icon,
    image,
    mediaType,
    symbol,
  } as const
}

/**
 * Returns a string representation of the given value, if possible.
 * @param {string | string[] | undefined | null} value - The value to convert to a string.
 * @returns {string | null} A string representation of the value, or null if not possible.
 */
export function asString(value: string | string[] | undefined | null): string | null {
  if (value === null || value === undefined) return null
  if (isString(value)) return value as string
  if (isArrayOfType(value, isString)) return (value as string[]).join('')
  return null
}
