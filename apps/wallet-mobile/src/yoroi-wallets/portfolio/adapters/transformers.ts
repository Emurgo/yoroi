import {Balance} from '@yoroi/types'
import {
  asConcatenedString,
  Cardano,
  CardanoApi,
  CardanoTokenId,
  isArrayOfType,
  isString,
  parseNumber,
} from '@yoroi/wallets'

import {CardanoToken} from '../types'

export function asApiTokenId(tokenId: string): Cardano.Api.TokenId {
  if (tokenId.includes('.')) {
    return tokenId as Cardano.Api.TokenId
  }
  return `${tokenId}.`
}

export const cardanoFutureTokenAsBalanceToken = (
  tokenId: Balance.Token['info']['id'],
  futureToken: Cardano.Api.FutureToken,
): Readonly<Balance.Token> => {
  const {onChain, offChain, supply} = futureToken

  // Nft only if supply is 1 and has 721
  if (supply === 1 && onChain.mintNftRecordSelected) {
    return cardanoOnChainMetadataAsBalanceToken({
      tokenId,
      metadata: onChain.mintNftRecordSelected,
      kind: 'nft',
      originalMetadatas: futureToken,
    })
  }

  // Ft offchain second
  if (offChain.isValid) {
    return cardanoOffChainTokenRegistryEntryAsBalanceToken({
      tokenId,
      entry: offChain.tokenRegistry,
      originalMetadatas: futureToken,
    })
  }

  // Ft onchain third
  if (onChain.mintFtRecordSelected) {
    return cardanoOnChainMetadataAsBalanceToken({
      tokenId,
      metadata: onChain.mintFtRecordSelected,
      kind: 'ft',
      originalMetadatas: futureToken,
    })
  }

  // Otherwise ft fallback record
  return cardanoOnChainMetadataAsBalanceToken({
    tokenId,
    metadata: onChain.mintNftRecordSelected,
    kind: 'ft',
    originalMetadatas: futureToken,
  })
}

export const cardanoOnChainMetadataAsBalanceToken = ({
  tokenId,
  metadata,
  kind,
  originalMetadatas,
}: {
  tokenId: Balance.Token['info']['id']
  metadata: Cardano.Api.NftMetadata | Cardano.Api.FtMetadata | undefined
  kind: Balance.TokenInfo['kind']
  originalMetadatas: Cardano.Api.FutureToken
}): Readonly<CardanoToken> => {
  const {name: assetNameUtf8, policyId} = CardanoTokenId.getTokenIdentity(tokenId)

  const id = tokenId
  const fingerprint = CardanoTokenId.asFingerprint(tokenId)
  const group = policyId
  const name = asConcatenedString(metadata?.name) ?? assetNameUtf8
  const description = asConcatenedString(metadata?.description)

  const image = discoverImage(metadata)
  const icon = image
  const mediaType = isString(metadata?.mediaType) ? metadata?.mediaType : undefined

  const website = discoverWebsite(metadata)

  const ticker = isString(metadata?.ticker) ? metadata?.ticker : undefined
  const symbol = isString(metadata?.symbol) ? metadata?.symbol : undefined

  const parsedDecimals = parseNumber(metadata?.decimals)
  const decimals = parsedDecimals

  const info: Balance.TokenInfo = {
    kind,
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
    website,
  }

  const files = cardanoFilesAsBalanceTokenFiles(metadata?.files)

  const token: CardanoToken = {
    info,
    files,
    metadatas: originalMetadatas,
  } as const

  return token
}

export const cardanoOffChainTokenRegistryEntryAsBalanceToken = ({
  tokenId,
  entry,
  originalMetadatas,
}: {
  tokenId: Balance.Token['info']['id']
  entry: Cardano.Api.TokenRegistryEntry
  originalMetadatas: Cardano.Api.FutureToken
}): Readonly<CardanoToken> => {
  const {name: assetNameUtf8, policyId} = CardanoTokenId.getTokenIdentity(tokenId)

  const id = tokenId
  const fingerprint = CardanoTokenId.asFingerprint(tokenId)
  const group = policyId

  const name = entry.name.value ?? assetNameUtf8
  const ticker = entry.ticker?.value
  const description = entry.description?.value
  const website = entry.url?.value
  const decimals = entry.decimals?.value

  const image = entry.logo?.value ? discoverIpfsLink(entry.logo?.value) : undefined
  const icon = image

  const info: Balance.TokenInfo = {
    kind: 'ft',
    id,
    fingerprint,
    name,
    description,
    group,
    decimals,
    ticker,
    icon,
    image,
    website,
  }
  const token: CardanoToken = {
    info,
    metadatas: originalMetadatas,
  } as const

  return token
}

export function cardanoFilesAsBalanceTokenFiles(metadataFiles: unknown): Balance.Token['files'] | undefined {
  const possibleFiles = isArrayOfType(metadataFiles, CardanoApi.isMetadataFile) ? metadataFiles : undefined
  if (!possibleFiles) return

  const files: Balance.Token['files'] = []
  for (const possibleFile of possibleFiles) {
    const {name: metaName, mediaType, src: metaSrc, ...rest} = possibleFile
    const name = asConcatenedString(metaName)
    const possibleSrc = asConcatenedString(metaSrc)

    if (possibleSrc) {
      const src = discoverIpfsLink(possibleSrc)
      const file: Balance.TokenFile = {
        name,
        mediaType,
        src,
        ...rest,
      }

      files.push(file)
    }
  }

  return files
}

const websiteFallbackKeys = ['url', 'website', 'homepage', 'www', 'site'] as const
export function discoverWebsite(
  metadata: Cardano.Api.FtMetadata | Cardano.Api.NftMetadata | undefined,
): string | undefined {
  for (const key of websiteFallbackKeys) {
    const possibleWebsite = metadata?.[key]
    const website: string | string[] | undefined =
      isArrayOfType(possibleWebsite, isString) || isString(possibleWebsite) ? possibleWebsite : undefined
    if (possibleWebsite) {
      return asConcatenedString(website)
    }
  }
}

const imageFallbackKeys = ['image', 'logo', 'img', 'src'] as const
export function discoverImage(
  metadata: Cardano.Api.FtMetadata | Cardano.Api.NftMetadata | undefined,
): string | undefined {
  for (const key of imageFallbackKeys) {
    const possibleImage = metadata?.[key]
    const image: string | string[] | undefined =
      isArrayOfType(possibleImage, isString) || isString(possibleImage) ? possibleImage : undefined
    const concatenatedImage = asConcatenedString(image)
    if (concatenatedImage) {
      return discoverIpfsLink(concatenatedImage)
    }
  }
}

export function discoverIpfsLink(image: string) {
  const isIpfsImage = image.startsWith('ipfs://')
  return isIpfsImage ? image?.replace('ipfs://', `https://ipfs.io/ipfs/`) : image
}
