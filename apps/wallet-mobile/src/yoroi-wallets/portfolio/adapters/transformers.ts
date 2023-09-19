import {Portfolio} from '@yoroi/types'
import {
  asConcatenedString,
  Cardano,
  CardanoApi,
  CardanoTokenId,
  isArrayOfType,
  isString,
  parseNumber,
} from '@yoroi/wallets'

import {RawUtxo} from '../../types'
import {Amounts, asQuantity, Quantities} from '../../utils'

export function asApiTokenId(tokenId: string): Cardano.Api.TokenId {
  if (tokenId.includes('.')) {
    return tokenId as Cardano.Api.TokenId
  }
  return `${tokenId}.`
}

export const cardanoFutureTokenAsBalanceToken = (
  tokenId: Portfolio.TokenInfo['id'],
  futureToken: Cardano.Api.FutureToken,
): Readonly<Portfolio.Token<Cardano.Api.FutureToken>> => {
  const {onChain, offChain, supply} = futureToken

  // Nft only if supply is 1 and has 721
  if (supply === 1 && onChain.mintNftRecordSelected) {
    return cardanoOnChainMetadataAsBalanceToken<Cardano.Api.FutureToken>({
      tokenId,
      metadata: onChain.mintNftRecordSelected,
      kind: 'nft',
      cardanoFutureToken: futureToken,
    })
  }

  // Ft offchain second
  if (offChain.isValid) {
    return cardanoOffChainTokenRegistryEntryAsBalanceToken({
      tokenId,
      entry: offChain.tokenRegistry,
      cardanoFutureToken: futureToken,
    })
  }

  // Ft onchain third
  if (onChain.mintFtRecordSelected) {
    return cardanoOnChainMetadataAsBalanceToken<Cardano.Api.FutureToken>({
      tokenId,
      metadata: onChain.mintFtRecordSelected,
      kind: 'ft',
      cardanoFutureToken: futureToken,
    })
  }

  // Otherwise ft fallback record
  return cardanoOnChainMetadataAsBalanceToken<Cardano.Api.FutureToken>({
    tokenId,
    metadata: onChain.mintNftRecordSelected,
    kind: 'ft',
    cardanoFutureToken: futureToken,
  })
}

export const cardanoOnChainMetadataAsBalanceToken = <M extends Record<string, unknown>>({
  tokenId,
  metadata,
  kind,
  cardanoFutureToken,
}: {
  tokenId: Portfolio.TokenInfo['id']
  metadata?: Cardano.Api.NftMetadata | Cardano.Api.FtMetadata
  kind: Portfolio.TokenInfo['kind']
  cardanoFutureToken?: M
}): Readonly<Portfolio.Token<M>> => {
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

  const info: Portfolio.TokenInfo = {
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

  const token: Portfolio.Token<M> = {
    info,
  }
  const files = cardanoFilesAsBalanceTokenFiles(metadata?.files)
  if (files) token['files'] = files
  if (cardanoFutureToken) token['metadatas'] = cardanoFutureToken

  const result: Readonly<Portfolio.Token<M>> = {...token} as const

  return result
}

export const cardanoOffChainTokenRegistryEntryAsBalanceToken = <M extends Record<string, unknown>>({
  tokenId,
  entry,
  cardanoFutureToken,
}: {
  tokenId: Portfolio.TokenInfo['id']
  entry: Cardano.Api.TokenRegistryEntry
  cardanoFutureToken: M
}): Readonly<Portfolio.Token<M>> => {
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

  const info: Portfolio.TokenInfo = {
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

  const token: Portfolio.Token<M> = {
    info,
  }
  if (cardanoFutureToken) token['metadatas'] = cardanoFutureToken

  const result: Readonly<Portfolio.Token<M>> = {...token} as const

  return result
}

export function cardanoFilesAsBalanceTokenFiles(metadataFiles: unknown): Portfolio.Token['files'] | undefined {
  const possibleFiles = isArrayOfType(metadataFiles, CardanoApi.isMetadataFile) ? metadataFiles : undefined
  if (!possibleFiles) return

  const files: Portfolio.Token['files'] = []
  for (const possibleFile of possibleFiles) {
    const {name: metaName, mediaType, src: metaSrc, ...rest} = possibleFile
    const name = asConcatenedString(metaName)
    const possibleSrc = asConcatenedString(metaSrc)

    if (possibleSrc) {
      const src = discoverIpfsLink(possibleSrc)
      const file: Portfolio.TokenFile = {
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

export function rawUtxosAsAmounts(utxos: ReadonlyArray<RawUtxo>, primaryTokenId: Portfolio.TokenInfo['id']) {
  return utxos.reduce(
    (previousAmounts, currentUtxo) => {
      const amounts = {
        ...previousAmounts,
        [primaryTokenId]: Quantities.sum([previousAmounts[primaryTokenId], asQuantity(currentUtxo.amount)]),
      }

      if (currentUtxo.assets) {
        return currentUtxo.assets.reduce((previousAmountsWithAssets, currentAsset) => {
          return {
            ...previousAmountsWithAssets,
            [currentAsset.assetId]: Quantities.sum([
              Amounts.getAmount(previousAmountsWithAssets, currentAsset.assetId).quantity,
              currentAsset.amount as Portfolio.Quantity,
            ]),
          }
        }, amounts)
      }

      return amounts
    },
    {[primaryTokenId]: Quantities.zero} as Portfolio.Amounts,
  )
}
