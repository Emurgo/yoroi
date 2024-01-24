import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Dimensions, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Spacer} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../navigation'
import {useTheme} from '../../../../theme'
import {Theme} from '../../../../theme/types'
import {BuyBannerIllustration} from '../../illustrations/BuyBannerIllustration'
import {useStrings} from '../useStrings'

const DIMENSIONS = Dimensions.get('window')

export const BuyBannerBig = () => {
  const strings = useStrings()
  const {track} = useMetrics()

  const {theme} = useTheme()
  const styles = React.useMemo(() => getStyles({theme}), [theme])
  const bannerWidth = DIMENSIONS.width - 16 * 2
  const bannerHeight = (bannerWidth * 174) / 512

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleExchange = () => {
    track.walletPageBuyBannerClicked()
    navigation.navigate('rampOnOff-start-rampOnOff')
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        style={styles.gradient}
        start={{x: 1, y: 1}}
        end={{x: 1, y: 1}}
        colors={theme.color.gradients['green']}
      >
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

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      backgroundColor: theme.color['white-static'],
      paddingBottom: 18,
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
      fontSize: 20,
      lineHeight: 30,
      fontWeight: '500',
      color: theme.color['black-static'],
      fontFamily: 'Rubik',
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    text: {
      fontSize: 15,
      lineHeight: 24,
      fontWeight: '400',
      color: theme.color['black-static'],
      fontFamily: 'Rubik',
      textAlign: 'center',
      paddingHorizontal: 50,
    },
    spaceButton: {
      paddingHorizontal: 16,
    },
  })
  return styles
}
