import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Dimensions, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Space} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../navigation'
import {BuyBannerIllustration} from '../../illustrations/BuyBannerIllustration'
import {useStrings} from '../useStrings'

const DIMENSIONS = Dimensions.get('window')

export const BuyBannerBig = () => {
  const strings = useStrings()
  const {track} = useMetrics()
  const {styles, colors} = useStyles()

  const bannerWidth = DIMENSIONS.width - 16 * 2
  const bannerHeight = (bannerWidth * 174) / 512

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleExchange = () => {
    track.walletPageBuyBannerClicked()
    navigation.navigate('rampOnOff-start-rampOnOff')
  }

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 1, y: 1}} colors={colors.gradientColor}>
        <BuyBannerIllustration width={bannerWidth} height={bannerHeight} />

        <Space />

        <Text style={styles.label}>{strings.getFirstCrypto}</Text>

        <Space height="xl" />

        <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

        <Space />

        <Button
          testID="rampOnOffButton"
          mainTheme
          title={strings.buyCrypto.toLocaleUpperCase()}
          onPress={handleExchange}
          style={styles.spaceButton}
          textStyles={styles.spaceButtonText}
        />
      </LinearGradient>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, space} = theme
  const styles = StyleSheet.create({
    root: {
      ...space['b-m'],
      backgroundColor: color.gray.min,
      flex: 1,
    },
    gradient: {
      ...space['b-xl'],
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      alignItems: 'center',
    },
    spaceButtonText: {
      ...space['none'],
    },
    label: {
      ...typography['heading-3-medium'],
      color: color.gray.max,
      textAlign: 'center',
    },
    text: {
      ...typography['body-1-l-regular'],
      ...space['x-xxl'],
      color: color.gray.max,
      textAlign: 'center',
    },
    spaceButton: {
      ...space['x-l'],
    },
  })
  const colors = {
    gradientColor: color.gradients['green'],
  }
  return {styles, colors} as const
}
