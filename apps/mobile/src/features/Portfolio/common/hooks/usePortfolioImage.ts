import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import * as React from 'react'
import {useCallback, useMemo} from 'react'
import {PixelRatio, Platform} from 'react-native'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {isDev} from '~/kernel/env'
import {logger} from '~/kernel/logger/logger'

export const usePortfolioImageInvalidate = () => {
  const {
    networkManager: {tokenManager},
  } = useSelectedNetwork()
  const mutation = useMutation({
    mutationFn: async (ids: Array<Portfolio.Token.Id>) => {
      logger.log(`Invalidating images ${ids}`)
      await tokenManager.api.tokenImageInvalidate(ids)
      await Image.clearDiskCache()
      await Image.clearMemoryCache()
    },
  })

  return {
    ...mutation,
    invalidate: mutation.mutate,
  }
}

const supportedTypes = [
  'img/png', // Yeah, someone minted that
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/svg',
  'image/tiff',
]

const supportedSizes = [64, 128, 256, 512, 720] as const

const getClosestSize = (size: string | number) => {
  const pixels = PixelRatio.getPixelSizeForLayoutSize(Number(size))
  return supportedSizes.find((size) => pixels <= size) ?? supportedSizes.at(-1)
}

type NativeAssetImageRequest = {
  policy: string
  name: string
  width: string | number
  height: string | number
  mediaType?: string
  contentFit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  kind?: 'logo' | 'metadata'
}
export const usePortfolioImage = ({
  policy,
  name,
  width: _width,
  height: _height,
  mediaType: _mediaType = 'image/webp',
  contentFit = 'cover',
  kind = 'metadata',
}: NativeAssetImageRequest) => {
  const {invalidate} = usePortfolioImageInvalidate()
  const {network} = useSelectedNetwork()
  const width = getClosestSize(_width)
  const height = getClosestSize(_height)
  const mediaType = _mediaType.toLocaleLowerCase()
  const isMediaTypeSupported = supportedTypes.includes(mediaType)
  const needsGif = mediaType === 'image/gif' && Platform.OS === 'ios'
  const mimeType = needsGif ? 'image/gif' : 'image/webp'
  const headers = useMemo(
    () => ({
      Accept: mimeType,
    }),
    [mimeType],
  )
  const queryClient = useQueryClient()

  const [isError, setError] = React.useState(false)
  const [isLoading, setLoading] = React.useState(true)

  const queryKey = [
    'native-asset-img',
    policy,
    name,
    `${width}x${height}`,
    contentFit,
  ]

  const query = useQuery({
    enabled: isMediaTypeSupported,
    staleTime: Infinity,
    queryKey,
    queryFn: (context) => {
      const count = queryClient.getQueryState(context.queryKey)?.dataUpdateCount
      const cache = count ? `&cache=${count}` : ''
      const requestUrl = `https://${network}.processed-media.yoroiwallet.com/${policy}/${name}?width=${width}&height=${height}&kind=${kind}&fit=${contentFit}${cache}`

      setLoading(true)
      return requestUrl
    },
  })

  const timerRef = React.useRef<ReturnType<typeof setTimeout>>()
  React.useEffect(() => () => clearTimeout(timerRef.current), [])

  const onError = useCallback(() => {
    const count = queryClient.getQueryState(queryKey)?.dataUpdateCount
    if (count && count < 10) {
      timerRef.current = setTimeout(query.refetch, count * 300)
    } else {
      if (isDev) {
        invalidate([`${policy}.${name}`])
        queryClient.invalidateQueries(queryKey)
      }
      setError(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, queryClient])

  const onLoad = useCallback(() => {
    setLoading(false)
  }, [])

  return {
    ...query,
    uri: query.data,
    headers,
    isError: isError || query.isError,
    isLoading: isLoading || query.isLoading,
    onError,
    onLoad,
  }
}
