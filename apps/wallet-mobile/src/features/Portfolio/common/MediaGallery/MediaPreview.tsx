import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import placeholder from '../../../../assets/img/nft-placeholder.png'
import {useSelectedWallet} from '../../../WalletManager/Context'

type MediaPreviewProps = {
  info: Portfolio.Token.Info
  showPlaceholder?: boolean
  style?: ImageStyle
  height: number
  width: number
  contentFit?: 'cover' | 'contain'
  blurRadius?: number
}

export const MediaPreview = ({
  info,
  showPlaceholder,
  style = {},
  height,
  width,
  contentFit = 'cover',
  blurRadius,
}: MediaPreviewProps) => {
  const {network} = useSelectedWallet()
  const [status, setStatus] = React.useState<'loading' | 'error' | 'ok'>('loading')

  const handleOnError = React.useCallback(() => setStatus('error'), [])
  const handleOnOk = React.useCallback(() => setStatus('ok'), [])

  const [policy, name] = info.id.split('.')
  const uri = showPlaceholder
    ? placeholder
    : `https://${network}.processed-media.yoroiwallet.com/${policy}/${name}?width=512&height=512&kind=metadata&fit=${contentFit}`

  return (
    <View style={{width, height, overflow: 'hidden'}}>
      <Image
        source={{uri, headers}}
        contentFit={contentFit}
        style={{width, height, ...style}}
        blurRadius={blurRadius}
        placeholder={blurhash}
        cachePolicy="memory-disk"
        onError={handleOnError}
        onLoad={handleOnOk}
      >
        {status !== 'ok' && <SkeletonImagePlaceholder width={width} height={height} />}
      </Image>
    </View>
  )
}

function SkeletonImagePlaceholder({width, height}: {width: number; height: number}) {
  return (
    <SkeletonPlaceholder>
      <View
        style={{
          width,
          height,
        }}
      />
    </SkeletonPlaceholder>
  )
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const headers = {
  Accept: 'image/webp',
} as const
