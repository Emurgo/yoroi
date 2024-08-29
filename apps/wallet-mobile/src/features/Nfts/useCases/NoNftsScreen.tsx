import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import noNftsImage from '../../../assets/img/no-nft.png'
import {Spacer} from '../../../components'

export function NoNftsScreen({heading, message}: {heading?: ReactNode; message: ReactNode}) {
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
      flex: 1,
    },
    contentText: {
      flex: 1,
      textAlign: 'center',

      ...atoms.heading_3_medium,
      color: color.gray_max,
    },

    image: {
      flex: 1,
      alignSelf: 'center',
      width: 200,
      height: 228,
    },
    imageContainer: {
      flex: 1,
      textAlign: 'center',
    },
  })
  return styles
}
