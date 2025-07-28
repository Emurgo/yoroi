import {atoms as a, useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {Image, Text, View} from 'react-native'

import noNftsImage from '~/../../../../../assets/img/no-nft.png'
import {Space} from '~/components/Space/Space'

type Props = {heading?: ReactNode; message: ReactNode}
export function EmptyGallery({heading, message}: Props) {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View style={[a.flex_1]}>
      <View>{heading}</View>

      <Space height={75} />

      <View style={[a.flex_1]}>
        <Image
          source={noNftsImage}
          style={[{width: 200, height: 228}, a.flex_1, a.self_center]}
        />

        <Space height={20} />

        <Text
          style={[
            {color: p.text_gray_max},
            a.flex_1,
            a.text_center,
            a.heading_3_medium,
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  )
}
