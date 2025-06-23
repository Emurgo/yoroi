import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import noNftsImage from '../../../../../../assets/img/no-nft.png'
import {Spacer} from '../../../../../../components/Spacer/Spacer'

type Props = {heading?: ReactNode; message: ReactNode}
export function EmptyGallery({heading, message}: Props) {
  const styles = useStyles()
  return (
    <View style={styles.root}>
      <View>{heading}</View>

      <Spacer height={75} />

      <View style={styles.imageContainer}>
        <Image source={noNftsImage} style={styles.image} />

        <Spacer height={20} />

        <Text style={styles.contentText}>{message}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    contentText: {
      color: color.text_gray_max,
      ...atoms.flex_1,
      ...atoms.text_center,
      ...atoms.heading_3_medium,
    },
    image: {
      width: 200,
      height: 228,
      ...atoms.flex_1,
      ...atoms.self_center,
    },
    imageContainer: {
      ...atoms.flex_1,
      ...atoms.text_center,
    },
  })
  return styles
}
