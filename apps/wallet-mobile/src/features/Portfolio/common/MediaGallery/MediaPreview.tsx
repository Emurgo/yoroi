import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, View} from 'react-native'

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

export const MediaPreview = 
  ({info, showPlaceholder, style = {}, height, width, contentFit = 'cover', blurRadius}: MediaPreviewProps) => {
    const {network} = useSelectedWallet()

    const [policy, name] = info.id.split('.')
    const uri = showPlaceholder
      ? placeholder
      : `https://${network}.processed-media.yoroiwallet.com/${policy}/${name}?width=256&height=256&kind=metadata&fit=${contentFit}`

    return (
      <View style={{width, height, overflow: 'hidden'}}>
        <Image
          source={{uri, headers}}
          contentFit={contentFit}
          style={{width, height, ...style}}
          blurRadius={blurRadius}
          placeholder={blurhash}
          cachePolicy="memory-disk"
        />
      </View>
    )
  }


const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const headers = {
  Accept: 'image/webp',
} as const
