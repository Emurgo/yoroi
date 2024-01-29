import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Dimensions, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Spacer} from '../../../../components'
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

        <Spacer />

        <Text style={styles.label}>{strings.getFirstCrypto}</Text>

        <Spacer height={4} />

        <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

        <Spacer />

        <Button
          testID="rampOnOffButton"
          shelleyTheme
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
  const styles = StyleSheet.create({
    root: {
      backgroundColor: theme.color['white-static'],
      paddingBottom: 18,
      flex: 1,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: 25,
    },
    spaceButtonText: {
      padding: 0,
    },
    label: {
      ...theme.typography['heading-3-regular'],
      color: theme.color['black-static'],
      fontWeight: '500',
      textAlign: 'center',
    },
    text: {
      ...theme.typography['body-1-regular'],
      color: theme.color['black-static'],
      fontWeight: '400',
      textAlign: 'center',
      paddingHorizontal: 50,
    },
    spaceButton: {
      paddingHorizontal: 16,
    },
  })
  const colors = {
    gradientColor: theme.color.gradients['green'],
  }
  return {styles, colors} as const
}
